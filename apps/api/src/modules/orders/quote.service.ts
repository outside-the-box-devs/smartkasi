import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import { haversineM } from '../../common/geo';
import { FulfilmentType, QuoteRequestDto } from './dto';

export interface StoredQuote {
  id: string;
  customerId: string;
  expiresAt: number;
  fulfilmentType: FulfilmentType;
  dropoffLat?: number;
  dropoffLng?: number;
  subtotalCents: number;
  serviceFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  shopCount: number;
  maxDistanceM: number;
  legs: Array<{
    shopId: string;
    shopName: string;
    distanceM: number;
    subtotalCents: number;
    items: Array<{ productId: string; name: string; qty: number; unitPriceCents: number }>;
  }>;
}

const QUOTE_TTL_MS = 15 * 60 * 1000;

/**
 * Basket pricing.
 *
 * Fee model, deliberately simple enough to explain on one line of a receipt:
 *
 *   service_fee = base + per_extra_shop x (shops - 1) + per_km x ceil(km)
 *
 * More shops and more distance mean a bigger fee AND a bigger courier payout.
 * That is the intended incentive, not an accident.
 *
 * KNOWN LIMITATION: quotes are held in memory, so they do not survive a restart
 * and break behind more than one instance. Fine for the demo, wrong for
 * production — move to a `quotes` table or Redis. The failure mode is a
 * spurious QUOTE_EXPIRED, which clients already handle.
 */
@Injectable()
export class QuoteService {
  private readonly quotes = new Map<string, StoredQuote>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async quote(customerId: string, dto: QuoteRequestDto) {
    const shopIds = [...new Set(dto.items.map((i) => i.shop_id))];

    const shops = await this.prisma.shop.findMany({ where: { id: { in: shopIds } } });
    if (shops.length !== shopIds.length) throw ApiError.notFound('One or more shops');

    const notAccepting = shops.filter((s) => !s.acceptsOrders);
    if (notAccepting.length) {
      throw ApiError.unprocessable(
        ApiErrorCode.SHOP_NOT_ACCEPTING_ORDERS,
        `These shops cannot take online orders: ${notAccepting.map((s) => s.name).join(', ')}`,
      );
    }

    const hasDropoff = dto.dropoff_lat !== undefined && dto.dropoff_lng !== undefined;
    const distanceByShop = new Map<string, number>(
      shops.map((s) => [
        s.id,
        hasDropoff ? haversineM(dto.dropoff_lat!, dto.dropoff_lng!, s.lat, s.lng) : 0,
      ]),
    );
    const maxDistance = Math.max(0, ...distanceByShop.values());

    const maxSpread = this.config.get<number>('fees.maxBasketSpreadM') ?? 2000;
    if (hasDropoff && maxDistance > maxSpread) {
      throw ApiError.unprocessable(
        ApiErrorCode.SHOPS_TOO_FAR_APART,
        `All shops in one basket must be within ${maxSpread}m of the delivery address`,
        [{ issue: `furthest shop is ${maxDistance}m away` }],
      );
    }

    // One query for every line in the basket, rather than one per item.
    const stock = await this.prisma.shopProduct.findMany({
      where: {
        shopId: { in: shopIds },
        productId: { in: [...new Set(dto.items.map((i) => i.product_id))] },
      },
      include: { product: { select: { name: true } } },
    });
    const stockKey = (shopId: string, productId: string) => `${shopId}:${productId}`;
    const stockMap = new Map(stock.map((s) => [stockKey(s.shopId, s.productId), s]));

    const legs: StoredQuote['legs'] = [];
    const presentedLegs: unknown[] = [];
    let subtotal = 0;

    for (const shop of shops) {
      const shopItems = dto.items.filter((i) => i.shop_id === shop.id);
      const priced: StoredQuote['legs'][number]['items'] = [];
      const unavailable: unknown[] = [];
      let legSubtotal = 0;

      for (const item of shopItems) {
        const row = stockMap.get(stockKey(shop.id, item.product_id));

        if (!row || !row.isAvailable || row.stockQty < item.qty) {
          unavailable.push({
            product_id: item.product_id,
            name: row?.product.name ?? 'Unknown item',
            requested_qty: item.qty,
            available_qty: row?.stockQty ?? 0,
          });
          continue;
        }

        const unitPrice = Number(row.priceCents);
        legSubtotal += unitPrice * item.qty;
        priced.push({
          productId: item.product_id,
          name: row.product.name,
          qty: item.qty,
          unitPriceCents: unitPrice,
        });
      }

      const distanceM = distanceByShop.get(shop.id) ?? 0;
      subtotal += legSubtotal;

      legs.push({
        shopId: shop.id,
        shopName: shop.name,
        distanceM,
        subtotalCents: legSubtotal,
        items: priced,
      });
      presentedLegs.push({
        shop_id: shop.id,
        shop_name: shop.name,
        distance_m: distanceM,
        subtotal_cents: legSubtotal,
        all_items_available: unavailable.length === 0,
        ...(unavailable.length ? { unavailable_items: unavailable } : {}),
      });
    }

    const fees = this.config.get<{
      baseCents: number;
      perExtraShopCents: number;
      perKmCents: number;
    }>('fees')!;

    const breakdown: Array<{ label: string; amount_cents: number }> = [];
    let serviceFee = 0;

    if (dto.fulfilment_type === FulfilmentType.delivery) {
      serviceFee += fees.baseCents;
      breakdown.push({ label: 'Base service fee', amount_cents: fees.baseCents });

      const extraShops = Math.max(0, shops.length - 1);
      if (extraShops > 0) {
        const amount = fees.perExtraShopCents * extraShops;
        serviceFee += amount;
        breakdown.push({ label: `Extra shop (${extraShops})`, amount_cents: amount });
      }

      const km = Math.ceil(maxDistance / 1000);
      if (km > 0) {
        const amount = fees.perKmCents * km;
        serviceFee += amount;
        breakdown.push({ label: `Distance (${km} km)`, amount_cents: amount });
      }
    }

    const stored: StoredQuote = {
      id: `qt_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
      customerId,
      expiresAt: Date.now() + QUOTE_TTL_MS,
      fulfilmentType: dto.fulfilment_type,
      dropoffLat: dto.dropoff_lat,
      dropoffLng: dto.dropoff_lng,
      subtotalCents: subtotal,
      serviceFeeCents: serviceFee,
      deliveryFeeCents: 0,
      totalCents: subtotal + serviceFee,
      shopCount: shops.length,
      maxDistanceM: maxDistance,
      legs,
    };

    this.quotes.set(stored.id, stored);
    this.sweep();

    return {
      quote_id: stored.id,
      expires_at: new Date(stored.expiresAt).toISOString(),
      fulfilment_type: stored.fulfilmentType,
      subtotal_cents: stored.subtotalCents,
      service_fee_cents: stored.serviceFeeCents,
      delivery_fee_cents: stored.deliveryFeeCents,
      total_cents: stored.totalCents,
      shop_count: stored.shopCount,
      max_distance_m: stored.maxDistanceM,
      fee_breakdown: breakdown,
      legs: presentedLegs,
    };
  }

  /** Single-use: consuming a quote removes it, so a double-submit 409s. */
  consume(quoteId: string, customerId: string): StoredQuote {
    const quote = this.quotes.get(quoteId);
    if (!quote || quote.expiresAt < Date.now() || quote.customerId !== customerId) {
      throw new ApiError(
        ApiErrorCode.QUOTE_EXPIRED,
        'This quote has expired — re-quote and show the customer the new total',
        409,
      );
    }
    this.quotes.delete(quoteId);
    return quote;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, q] of this.quotes) {
      if (q.expiresAt < now) this.quotes.delete(id);
    }
  }
}
