import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';

import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import { haversineM } from '../../common/geo';
import type { AuthUser } from '../../common/types/auth.types';
import { CollectJobDto, DeliverJobDto, RequestDeliveryDto } from './dto';
import {
  MODE_MAX_RADIUS_M,
  PICKUP_LEG_STATUSES,
  presentCustomerDelivery,
  routeDistanceM,
  sequencePickups,
  type RouteStop,
} from './delivery.presenter';
import type {
  Courier,
  Delivery,
  Order,
  OrderItem,
  OrderShop,
  Profile,
  Shop,
} from '../../generated/prisma/client';

type LegWithShop = OrderShop & { shop: Shop; items: OrderItem[] };
type OrderWithLegs = Order & { legs: LegWithShop[]; customer: Profile };
type CourierWithProfile = Courier & { profile: Profile };
type DeliveryRow = Delivery & {
  order: OrderWithLegs;
  courier: CourierWithProfile | null;
};

const DELIVERY_INCLUDE = {
  order: {
    include: { legs: { include: { shop: true, items: true } }, customer: true },
  },
  courier: { include: { profile: true } },
} as const;

/** Orders a courier may be dispatched for: at least one shop has committed. */
const DISPATCHABLE_ORDER_STATUSES = [
  'accepted',
  'partially_accepted',
  'ready',
] as const;

/**
 * How long a job stays on the board before a courier has to refresh.
 *
 * Computed, not stored. There is no `offered_at` column and adding one for a
 * five-minute display value would be a migration in exchange for nothing —
 * `accept` is guarded by a conditional update, so a stale offer loses the race
 * rather than double-booking.
 */
const OFFER_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class DeliveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ---- customer side ------------------------------------------------------

  /**
   * Idempotent on purpose: `deliveries.order_id` is unique, and a customer
   * double-tapping "get it delivered" is a normal event, not a 409.
   */
  async request(user: AuthUser, orderId: string, dto: RequestDeliveryDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { legs: true },
    });
    if (!order) throw ApiError.notFound('Order');
    if (order.customerId !== user.id && user.role !== 'admin') {
      throw ApiError.forbidden('This order is not yours');
    }

    if (order.fulfilmentType !== 'delivery') {
      throw ApiError.unprocessable(
        ApiErrorCode.VALIDATION_FAILED,
        'This order is for collection — there is nothing to deliver',
      );
    }
    if (['cancelled', 'rejected', 'completed'].includes(order.status)) {
      throw ApiError.unprocessable(
        ApiErrorCode.VALIDATION_FAILED,
        `An order in status '${order.status}' cannot be dispatched`,
      );
    }
    if (order.dropoffLat === null || order.dropoffLng === null) {
      throw ApiError.unprocessable(
        ApiErrorCode.VALIDATION_FAILED,
        'This order has no delivery address to dispatch to',
      );
    }

    const existing = await this.prisma.delivery.findUnique({
      where: { orderId },
    });
    if (!existing) {
      await this.prisma.delivery.create({
        data: {
          orderId,
          status: 'unassigned',
          // Stored as the offer filter, then overwritten with the accepting
          // courier's real mode. Null means "any mode may take this".
          mode: dto.preferred_mode ?? null,
          payoutCents: BigInt(this.payoutFor(order.serviceFeeCents)),
        },
      });
    }

    return this.customerView(orderId);
  }

  /**
   * Customer tracking. Returns the privacy-safe shape and nothing else — see
   * delivery.presenter.ts.
   */
  async track(user: AuthUser, deliveryId: string) {
    const row = await this.load(deliveryId);

    const isCustomer = row.order.customerId === user.id;
    const isAssignedCourier =
      row.courierId !== null && row.courierId === user.id;
    if (!isCustomer && !isAssignedCourier && user.role !== 'admin') {
      throw ApiError.forbidden('This delivery is not yours');
    }

    return this.present(row);
  }

  // ---- courier side -------------------------------------------------------

  /**
   * The job board.
   *
   * Filtered from the courier's home address, because this API never stores or
   * reads a live courier position for matching. A courier who has not set a
   * home address sees everything unassigned rather than nothing — an empty
   * board looks like a broken app.
   */
  async jobs(user: AuthUser) {
    const courier = await this.requireCourier(user.id);

    const rows = await this.prisma.delivery.findMany({
      where: {
        status: 'unassigned',
        courierId: null,
        // Null mode means the customer expressed no preference.
        OR: [{ mode: null }, { mode: courier.mode }],
        order: {
          status: { in: [...DISPATCHABLE_ORDER_STATUSES] },
          legs: { some: { status: { in: PICKUP_LEG_STATUSES } } },
        },
      },
      include: DELIVERY_INCLUDE,
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    const reach = Math.min(courier.maxRadiusM, MODE_MAX_RADIUS_M[courier.mode]);
    const home =
      courier.profile.homeLat !== null && courier.profile.homeLng !== null
        ? { lat: courier.profile.homeLat, lng: courier.profile.homeLng }
        : null;

    const expiresAt = new Date(Date.now() + OFFER_TTL_MS).toISOString();
    const data: unknown[] = [];

    for (const row of rows) {
      const stops = this.stopsFor(row);
      if (stops.length === 0) continue;

      if (home) {
        const toFirstPickup = haversineM(
          home.lat,
          home.lng,
          stops[0].lat,
          stops[0].lng,
        );
        if (toFirstPickup > reach) continue;
      }

      data.push({
        delivery_id: row.id,
        order_number: row.order.orderNumber,
        pickup_count: stops.length,
        total_distance_m: routeDistanceM(stops, this.dropoffOf(row)),
        payout_cents: Number(row.payoutCents),
        mode: courier.mode,
        expires_at: expiresAt,
      });
    }

    return { data };
  }

  /**
   * Two couriers tapping the same job at the same moment is the normal case on
   * a small board, not an edge case. The conditional `updateMany` is the whole
   * defence: whoever writes second matches zero rows and is told so, instead of
   * quietly stealing an assigned job.
   */
  async accept(user: AuthUser, deliveryId: string) {
    const courier = await this.requireCourier(user.id);
    const row = await this.load(deliveryId);

    if (!DISPATCHABLE_ORDER_STATUSES.includes(row.order.status as never)) {
      throw ApiError.unprocessable(
        ApiErrorCode.COURIER_NOT_AVAILABLE,
        `Order ${row.order.orderNumber} is no longer available for dispatch`,
      );
    }

    const claimed = await this.prisma.delivery.updateMany({
      where: { id: deliveryId, status: 'unassigned', courierId: null },
      data: {
        courierId: courier.id,
        status: 'assigned',
        mode: courier.mode,
        assignedAt: new Date(),
      },
    });

    if (claimed.count === 0) {
      throw new ApiError(
        ApiErrorCode.DELIVERY_ALREADY_ASSIGNED,
        'Another courier took this job first',
        HttpStatus.CONFLICT,
      );
    }

    return this.courierView(deliveryId);
  }

  /**
   * One shop collected. The delivery only becomes `collected` once every
   * committed leg is in the bag — a courier holding two of three shops is
   * `en_route_pickup`, not on the way to the customer.
   */
  async collect(user: AuthUser, deliveryId: string, dto: CollectJobDto) {
    const row = await this.requireAssigned(user, deliveryId);

    if (['delivered', 'failed'].includes(row.status)) {
      throw ApiError.unprocessable(
        ApiErrorCode.VALIDATION_FAILED,
        `This delivery is already ${row.status}`,
      );
    }

    const stops = this.stopsFor(row);
    const target = dto.shop_id
      ? stops.find((s) => s.shopId === dto.shop_id)
      : stops.find((s) => !s.collected);

    if (!target) {
      throw dto.shop_id
        ? ApiError.unprocessable(
            ApiErrorCode.VALIDATION_FAILED,
            'That shop is not a pickup on this delivery',
          )
        : ApiError.unprocessable(
            ApiErrorCode.VALIDATION_FAILED,
            'Every pickup on this delivery is already collected',
          );
    }

    const remaining = stops.filter(
      (s) => !s.collected && s.shopId !== target.shopId,
    ).length;
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.orderShop.update({
        where: {
          orderId_shopId: { orderId: row.orderId, shopId: target.shopId },
        },
        data: { status: 'collected' },
      });

      await tx.delivery.update({
        where: { id: deliveryId },
        data:
          remaining === 0
            ? { status: 'collected', collectedAt: row.collectedAt ?? now }
            : { status: 'en_route_pickup' },
      });

      if (remaining === 0) {
        await tx.order.update({
          where: { id: row.orderId },
          data: { status: 'dispatched' },
        });
      }
    });

    return this.courierView(deliveryId);
  }

  /** Handover. Ends the delivery and the order together. */
  async deliver(user: AuthUser, deliveryId: string, dto: DeliverJobDto) {
    const row = await this.requireAssigned(user, deliveryId);

    if (row.status === 'delivered') return this.courierView(deliveryId);
    if (!['collected', 'en_route_dropoff'].includes(row.status)) {
      throw ApiError.unprocessable(
        ApiErrorCode.DELIVERY_NOT_COLLECTED,
        'Collect every shop on this run before handing over',
      );
    }

    const due = Number(row.order.totalCents);
    if (
      dto.cash_collected_cents !== undefined &&
      dto.cash_collected_cents !== due
    ) {
      throw ApiError.unprocessable(
        ApiErrorCode.TOTALS_MISMATCH,
        `Cash collected does not match the order total`,
        [{ issue: `expected ${due} cents, got ${dto.cash_collected_cents}` }],
      );
    }

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          status: 'delivered',
          deliveredAt: now,
          ...(dto.proof_photo_url
            ? { proofPhotoUrl: dto.proof_photo_url }
            : {}),
        },
      }),
      this.prisma.order.update({
        where: { id: row.orderId },
        data: { status: 'completed', completedAt: now },
      }),
    ]);

    return this.courierView(deliveryId);
  }

  // ---- internals ----------------------------------------------------------

  private payoutFor(serviceFeeCents: bigint): number {
    const pct = this.config.get<number>('fees.courierSharePct') ?? 80;
    return Math.round((Number(serviceFeeCents) * pct) / 100);
  }

  private async requireCourier(userId: string): Promise<CourierWithProfile> {
    const courier = await this.prisma.courier.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!courier)
      throw ApiError.forbidden('You are not registered as a courier');
    if (!courier.isVerified) {
      throw ApiError.unprocessable(
        ApiErrorCode.COURIER_NOT_AVAILABLE,
        'Your courier account is not verified yet',
      );
    }
    if (!courier.isOnline) {
      throw ApiError.unprocessable(
        ApiErrorCode.COURIER_NOT_AVAILABLE,
        'Go online to see and accept jobs',
      );
    }
    return courier;
  }

  private async load(deliveryId: string): Promise<DeliveryRow> {
    const row = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: DELIVERY_INCLUDE,
    });
    if (!row) throw ApiError.notFound('Delivery');
    return row;
  }

  private async requireAssigned(
    user: AuthUser,
    deliveryId: string,
  ): Promise<DeliveryRow> {
    const row = await this.load(deliveryId);
    if (row.courierId !== user.id && user.role !== 'admin') {
      throw ApiError.forbidden('This delivery is assigned to another courier');
    }
    return row;
  }

  private stopsFor(row: DeliveryRow): RouteStop[] {
    return sequencePickups(row.order.legs);
  }

  private dropoffOf(row: DeliveryRow) {
    return { lat: row.order.dropoffLat, lng: row.order.dropoffLng };
  }

  private present(row: DeliveryRow) {
    return presentCustomerDelivery(
      row,
      this.stopsFor(row),
      this.dropoffOf(row),
    );
  }

  private async customerView(orderId: string) {
    const row = await this.prisma.delivery.findUnique({
      where: { orderId },
      include: DELIVERY_INCLUDE,
    });
    if (!row) throw ApiError.notFound('Delivery');
    return this.present(row);
  }

  /**
   * Courier-app view. This one DOES carry addresses, phone numbers and
   * sequencing — it is the working document for the run. Never hand it to a
   * customer; `presentCustomerDelivery` is their shape.
   */
  private async courierView(deliveryId: string) {
    const row = await this.load(deliveryId);
    const stops = this.stopsFor(row);

    return {
      id: row.id,
      order_id: row.orderId,
      order_number: row.order.orderNumber,
      status: row.status,
      mode: row.mode,
      payout_cents: Number(row.payoutCents),
      // v1 takes cash at handover, so the whole order total is owed to the
      // courier at the gate.
      cash_to_collect_cents: Number(row.order.totalCents),
      pickups: stops.map((s, i) => ({
        sequence: i + 1,
        shop_id: s.shopId,
        shop_name: s.shopName,
        address_line: s.addressLine,
        lat: s.lat,
        lng: s.lng,
        phone: s.phone,
        collected: s.collected,
        item_count: s.itemCount,
      })),
      dropoff: {
        address_line: row.order.dropoffAddress,
        notes: row.order.dropoffNotes,
        lat: row.order.dropoffLat,
        lng: row.order.dropoffLng,
        customer_first_name: row.order.customer.fullName.split(' ')[0],
        customer_phone: row.order.customer.phone,
      },
      updated_at: (
        row.deliveredAt ??
        row.collectedAt ??
        row.assignedAt ??
        row.createdAt
      ).toISOString(),
    };
  }
}
