import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import { paginate, PaginationQuery } from '../../common/dto/pagination.dto';
import type { AuthUser } from '../../common/types/auth.types';
import { ShopAccessService } from '../shops/shop-access.service';
import {
  AcceptLegDto,
  CancelOrderDto,
  CreateOrderDto,
  ListOrdersQuery,
  RejectLegDto,
} from './dto';
import { QuoteService } from './quote.service';
import {
  presentCustomerDelivery,
  sequencePickups,
  type CustomerDeliveryInput,
} from '../delivery/delivery.presenter';
import type {
  Order,
  OrderItem,
  OrderShop,
  OrderShopStatus,
  OrderStatus,
  Shop,
} from '../../generated/prisma/client';

type LegWithItems = OrderShop & { shop: Shop; items: OrderItem[] };
type DeliveryWithCourier = CustomerDeliveryInput;
type OrderWithLegs = Order & {
  legs: LegWithItems[];
  delivery?: DeliveryWithCourier | null;
};

const CANCELLABLE: OrderStatus[] = ['placed', 'accepted', 'partially_accepted'];

/**
 * Enough of the delivery to build a CustomerDelivery, and no more. The courier
 * profile is pulled for the display name only — presentCustomerDelivery
 * withholds it entirely until the run is collected.
 */
const DELIVERY_FOR_ORDER = {
  include: {
    courier: { include: { profile: { select: { fullName: true } } } },
  },
} as const;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ShopAccessService,
    private readonly quotes: QuoteService,
  ) {}

  /**
   * Prices come from the quote, not from a recalculation. The customer pays
   * what they were shown — re-pricing at placement produces a support ticket
   * you cannot answer.
   *
   * Stock is NOT reserved. Spazas also sell over the counter, so a reservation
   * would be a fiction. Shops reject their own leg instead.
   */
  async create(user: AuthUser, dto: CreateOrderDto) {
    const quote = this.quotes.consume(dto.quote_id, user.id);

    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.orderNumber(),
        customerId: user.id,
        status: 'placed',
        fulfilmentType: quote.fulfilmentType,
        dropoffLat: quote.dropoffLat,
        dropoffLng: quote.dropoffLng,
        dropoffAddress: dto.dropoff_address,
        dropoffNotes: dto.dropoff_notes,
        subtotalCents: BigInt(quote.subtotalCents),
        serviceFeeCents: BigInt(quote.serviceFeeCents),
        deliveryFeeCents: BigInt(quote.deliveryFeeCents),
        totalCents: BigInt(quote.totalCents),
        quoteShopCount: quote.shopCount,
        quoteMaxRadiusM: quote.maxDistanceM,
        legs: {
          create: quote.legs.map((leg) => ({
            shopId: leg.shopId,
            status: 'pending' as const,
            subtotalCents: BigInt(leg.subtotalCents),
            distanceM: leg.distanceM,
            items: {
              create: leg.items.map((item) => ({
                productId: item.productId,
                productName: item.name,
                qty: item.qty,
                unitPriceCents: BigInt(item.unitPriceCents),
                lineTotalCents: BigInt(item.qty * item.unitPriceCents),
              })),
            },
          })),
        },
      },
    });

    return this.get(user, order.id);
  }

  async listMine(user: AuthUser, q: ListOrdersQuery) {
    const where = {
      customerId: user.id,
      ...(q.status ? { status: q.status as OrderStatus } : {}),
    };

    const [total, rows] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          legs: { include: { shop: true, items: true } },
          delivery: DELIVERY_FOR_ORDER,
        },
        orderBy: { placedAt: 'desc' },
        skip: q.offset,
        take: q.per_page,
      }),
    ]);

    return paginate(
      rows.map((r) => this.present(r)),
      total,
      q,
    );
  }

  async get(user: AuthUser, orderId: string) {
    const row = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        legs: { include: { shop: true, items: true } },
        delivery: DELIVERY_FOR_ORDER,
      },
    });
    if (!row) throw ApiError.notFound('Order');

    if (row.customerId !== user.id && user.role !== 'admin') {
      // A shop may read an order it has a leg in; anyone else may not.
      const involved = row.legs.some((l) => l.shop.ownerId === user.id);
      const asStaff = involved
        ? true
        : (await this.prisma.shopStaff.count({
            where: {
              userId: user.id,
              shopId: { in: row.legs.map((l) => l.shopId) },
            },
          })) > 0;
      if (!involved && !asStaff)
        throw ApiError.forbidden('This order is not yours');
    }

    return this.present(row);
  }

  async cancel(user: AuthUser, orderId: string, dto: CancelOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { customerId: true, status: true },
    });
    if (!order) throw ApiError.notFound('Order');
    if (order.customerId !== user.id && user.role !== 'admin') {
      throw ApiError.forbidden('This order is not yours');
    }
    if (!CANCELLABLE.includes(order.status)) {
      throw new ApiError(
        ApiErrorCode.ORDER_NOT_CANCELLABLE,
        `An order in status '${order.status}' can no longer be cancelled`,
        409,
      );
    }

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: dto.reason,
        },
      }),
      this.prisma.orderShop.updateMany({
        where: {
          orderId,
          status: { in: ['pending', 'accepted', 'preparing'] },
        },
        data: { status: 'cancelled' },
      }),
    ]);

    return this.get(user, orderId);
  }

  // ---- shop side ----------------------------------------------------------

  async listForShop(user: AuthUser, shopId: string, q: ListOrdersQuery) {
    await this.access.require(user, shopId);

    const where = {
      shopId,
      ...(q.status ? { status: q.status as OrderShopStatus } : {}),
    };

    const [total, legs] = await Promise.all([
      this.prisma.orderShop.count({ where }),
      this.prisma.orderShop.findMany({
        where,
        include: {
          items: true,
          order: { include: { customer: { select: { fullName: true } } } },
        },
        orderBy: { order: { placedAt: 'desc' } },
        skip: q.offset,
        take: q.per_page,
      }),
    ]);

    const data = legs.map((l) => ({
      id: l.id,
      order_id: l.orderId,
      order_number: l.order.orderNumber,
      status: l.status,
      fulfilment_type: l.order.fulfilmentType,
      // First name only. A shop does not need the customer's full identity to
      // pack a bag, and the fewer places a full name lives, the better.
      customer_first_name: l.order.customer.fullName.split(' ')[0],
      subtotal_cents: Number(l.subtotalCents),
      items: l.items.map((i) => this.presentItem(i)),
      placed_at: l.order.placedAt.toISOString(),
    }));

    return paginate(data, total, q as PaginationQuery);
  }

  async acceptLeg(
    user: AuthUser,
    orderId: string,
    shopId: string,
    dto: AcceptLegDto,
  ) {
    await this.access.require(user, shopId);
    const leg = await this.requireLeg(orderId, shopId);

    await this.prisma.$transaction(async (tx) => {
      if (dto.fulfilled?.length) {
        for (const f of dto.fulfilled) {
          const item = await tx.orderItem.findFirst({
            where: { id: f.order_item_id, orderShopId: leg.id },
            select: { unitPriceCents: true },
          });
          if (!item) continue;
          await tx.orderItem.update({
            where: { id: f.order_item_id },
            data: {
              fulfilledQty: f.fulfilled_qty,
              lineTotalCents: item.unitPriceCents * BigInt(f.fulfilled_qty),
            },
          });
        }
      } else {
        const items = await tx.orderItem.findMany({
          where: { orderShopId: leg.id },
        });
        for (const item of items) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { fulfilledQty: item.qty },
          });
        }
      }

      const sum = await tx.orderItem.aggregate({
        where: { orderShopId: leg.id },
        _sum: { lineTotalCents: true },
      });

      await tx.orderShop.update({
        where: { id: leg.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          subtotalCents: sum._sum.lineTotalCents ?? BigInt(0),
        },
      });
    });

    await this.recomputeOrder(orderId);
    return this.legView(leg.id);
  }

  async rejectLeg(
    user: AuthUser,
    orderId: string,
    shopId: string,
    dto: RejectLegDto,
  ) {
    await this.access.require(user, shopId);
    const leg = await this.requireLeg(orderId, shopId);

    await this.prisma.orderShop.update({
      where: { id: leg.id },
      data: {
        status: 'rejected',
        rejectedReason: dto.note ? `${dto.reason}: ${dto.note}` : dto.reason,
      },
    });

    await this.recomputeOrder(orderId);
    return this.legView(leg.id);
  }

  async readyLeg(user: AuthUser, orderId: string, shopId: string) {
    await this.access.require(user, shopId);
    const leg = await this.requireLeg(orderId, shopId);

    await this.prisma.orderShop.update({
      where: { id: leg.id },
      data: { status: 'ready', readyAt: new Date() },
    });

    await this.recomputeOrder(orderId);
    return this.legView(leg.id);
  }

  // ---- internals ----------------------------------------------------------

  /**
   * Roll per-leg statuses up into the order status.
   *
   * `partially_accepted` is the realistic outcome for a three-shop basket, not
   * an edge case — one spaza being out of pilchards must not kill the order.
   */
  private async recomputeOrder(orderId: string): Promise<void> {
    const legs = await this.prisma.orderShop.findMany({
      where: { orderId },
      select: { status: true, subtotalCents: true },
    });
    if (legs.length === 0) return;

    const statuses = legs.map((l) => l.status);
    const live = statuses.filter((s) => s !== 'rejected' && s !== 'cancelled');

    let status: OrderStatus;
    if (live.length === 0) status = 'rejected';
    else if (statuses.includes('pending')) status = 'placed';
    else if (live.every((s) => s === 'ready' || s === 'collected'))
      status = 'ready';
    else if (live.length < statuses.length) status = 'partially_accepted';
    else status = 'accepted';

    const subtotal = legs
      .filter((l) => l.status !== 'rejected')
      .reduce((sum, l) => sum + l.subtotalCents, BigInt(0));

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { serviceFeeCents: true, deliveryFeeCents: true },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        subtotalCents: subtotal,
        totalCents:
          subtotal +
          (order?.serviceFeeCents ?? BigInt(0)) +
          (order?.deliveryFeeCents ?? BigInt(0)),
      },
    });
  }

  private async requireLeg(orderId: string, shopId: string) {
    const leg = await this.prisma.orderShop.findUnique({
      where: { orderId_shopId: { orderId, shopId } },
      select: { id: true, status: true },
    });
    if (!leg) throw ApiError.notFound('Order leg');
    return leg;
  }

  private async legView(legId: string) {
    const row = await this.prisma.orderShop.findUnique({
      where: { id: legId },
      include: { shop: true, items: true },
    });
    if (!row) throw ApiError.notFound('Order leg');
    return this.presentLeg(row);
  }

  private present(row: OrderWithLegs) {
    return {
      id: row.id,
      order_number: row.orderNumber,
      customer_id: row.customerId,
      status: row.status,
      fulfilment_type: row.fulfilmentType,
      dropoff_address: row.dropoffAddress,
      dropoff_notes: row.dropoffNotes,
      subtotal_cents: Number(row.subtotalCents),
      service_fee_cents: Number(row.serviceFeeCents),
      delivery_fee_cents: Number(row.deliveryFeeCents),
      total_cents: Number(row.totalCents),
      legs: row.legs.map((l) => this.presentLeg(l)),
      delivery: row.delivery
        ? presentCustomerDelivery(row.delivery, sequencePickups(row.legs), {
            lat: row.dropoffLat,
            lng: row.dropoffLng,
          })
        : null,
      placed_at: row.placedAt.toISOString(),
      completed_at: row.completedAt?.toISOString() ?? null,
    };
  }

  private presentLeg(l: LegWithItems) {
    return {
      id: l.id,
      shop_id: l.shopId,
      shop_name: l.shop.name,
      shop_phone: l.shop.phone,
      status: l.status,
      distance_m: l.distanceM,
      subtotal_cents: Number(l.subtotalCents),
      rejected_reason: l.rejectedReason,
      items: l.items.map((i) => this.presentItem(i)),
    };
  }

  private presentItem(i: OrderItem) {
    return {
      id: i.id,
      product_id: i.productId,
      product_name: i.productName,
      qty: i.qty,
      fulfilled_qty: i.fulfilledQty,
      unit_price_cents: Number(i.unitPriceCents),
      line_total_cents: Number(i.lineTotalCents),
    };
  }

  private orderNumber(): string {
    return `SK-${randomBytes(3).toString('hex').toUpperCase()}`;
  }
}
