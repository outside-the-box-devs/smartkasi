import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { paginate } from '../../common/dto/pagination.dto';
import { boxWhere, haversineM } from '../../common/geo';
import { SearchProductsQuery } from './dto';
import type { Prisma } from '../../generated/prisma/client';

/**
 * Cross-shop price comparison — the feature the whole catalog design exists to
 * support. One query returns each matching product with every nearby offer, the
 * distance, and the average price, so the customer can see whether R21 down the
 * road is a rip-off.
 *
 * Only barcoded products participate. Shop-local items (a shop's own kota) are
 * excluded by design because they are not comparable across shops.
 *
 * Paging is over PRODUCTS, not offers — otherwise one popular product with
 * eight stockists eats the whole page and the customer sees a single item.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async products(q: SearchProductsQuery) {
    const hasPoint = q.lat !== undefined && q.lng !== undefined;

    const shopWhere: Prisma.ShopWhereInput = { isActive: true };
    if (hasPoint) Object.assign(shopWhere, boxWhere(q.lat!, q.lng!, q.radius_m));

    const where: Prisma.ShopProductWhereInput = {
      isAvailable: true,
      shop: shopWhere,
      product: {
        barcode: { not: null },
        OR: [
          { name: { contains: q.q, mode: 'insensitive' } },
          { brand: { contains: q.q, mode: 'insensitive' } },
        ],
      },
    };
    if (q.in_stock_only) where.stockQty = { gt: 0 };

    const rows = await this.prisma.shopProduct.findMany({
      where,
      include: { shop: true, product: true },
    });

    // Bounding box over-selects the corners; haversine trims it to a circle.
    const offers = rows
      .map((r) => ({
        row: r,
        distance: hasPoint ? haversineM(q.lat!, q.lng!, r.shop.lat, r.shop.lng) : null,
      }))
      .filter((o) => !hasPoint || (o.distance ?? 0) <= q.radius_m);

    const grouped = new Map<string, typeof offers>();
    for (const offer of offers) {
      const bucket = grouped.get(offer.row.productId) ?? [];
      bucket.push(offer);
      grouped.set(offer.row.productId, bucket);
    }

    const results = [...grouped.entries()].map(([productId, group]) => {
      const prices = group.map((g) => Number(g.row.priceCents));
      const product = group[0].row.product;

      const sorted = [...group].sort((a, b) =>
        q.sort === 'distance'
          ? (a.distance ?? 0) - (b.distance ?? 0) || Number(a.row.priceCents) - Number(b.row.priceCents)
          : Number(a.row.priceCents) - Number(b.row.priceCents),
      );

      return {
        productId,
        bestPrice: Math.min(...prices),
        payload: {
          product: {
            id: product.id,
            barcode: product.barcode,
            name: product.name,
            brand: product.brand,
            unit_size: product.unitSize,
            image_url: product.imageUrl,
            is_verified: product.isVerified,
          },
          price_stats: {
            offer_count: prices.length,
            avg_price_cents: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
            min_price_cents: Math.min(...prices),
            max_price_cents: Math.max(...prices),
          },
          offers: sorted.map((g) => ({
            shop_id: g.row.shopId,
            shop_name: g.row.shop.name,
            distance_m: g.distance,
            price_cents: Number(g.row.priceCents),
            stock_qty: g.row.stockQty,
            accepts_orders: g.row.shop.acceptsOrders,
          })),
        },
      };
    });

    results.sort((a, b) => a.bestPrice - b.bestPrice);

    const page = results.slice(q.offset, q.offset + q.per_page);
    return paginate(page.map((r) => r.payload), results.length, q);
  }
}
