import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import { paginate } from '../../common/dto/pagination.dto';
import { CreateProductDto, ListProductsQuery } from './dto';
import type { Category, Prisma, Product } from '../../generated/prisma/client';

type ProductWithCategory = Product & { category: Category | null };

export function presentProduct(p: ProductWithCategory) {
  return {
    id: p.id,
    barcode: p.barcode,
    name: p.name,
    brand: p.brand,
    unit_size: p.unitSize,
    image_url: p.imageUrl,
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
    created_by_shop_id: p.createdByShopId,
    is_verified: p.isVerified,
    updated_at: p.updatedAt.toISOString(),
  };
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ListProductsQuery) {
    const where: Prisma.ProductWhereInput = {};
    if (q.q) {
      where.OR = [
        { name: { contains: q.q, mode: 'insensitive' } },
        { brand: { contains: q.q, mode: 'insensitive' } },
      ];
    }
    if (q.category_id) where.categoryId = q.category_id;

    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: [{ isVerified: 'desc' }, { name: 'asc' }],
        skip: q.offset,
        take: q.per_page,
      }),
    ]);

    return paginate(rows.map(presentProduct), total, q);
  }

  async get(productId: string) {
    const row = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });
    if (!row) throw ApiError.notFound('Product');

    return { ...presentProduct(row), price_stats: await this.priceStats(productId) };
  }

  /**
   * Cross-shop price statistics.
   *
   * Computed here rather than read from the v_product_price_stats view: Prisma
   * would need the `views` preview feature and a second model for what is three
   * lines of arithmetic. The view stays in schema.sql for ad-hoc SQL.
   */
  private async priceStats(productId: string) {
    const offers = await this.prisma.shopProduct.findMany({
      where: {
        productId,
        isAvailable: true,
        shop: { isActive: true },
        product: { barcode: { not: null } },
      },
      select: { priceCents: true },
    });

    if (offers.length === 0) {
      return { offer_count: 0, avg_price_cents: 0, min_price_cents: 0, max_price_cents: 0 };
    }

    const prices = offers.map((o) => Number(o.priceCents));
    return {
      offer_count: prices.length,
      avg_price_cents: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min_price_cents: Math.min(...prices),
      max_price_cents: Math.max(...prices),
    };
  }

  /**
   * Returns { created: false } when a product with that barcode already exists,
   * which the controller maps to 200 rather than 201. A scan that misses in one
   * shop must not fail because another shop already added the item.
   */
  async create(dto: CreateProductDto): Promise<{ created: boolean; product: unknown }> {
    if (!dto.barcode && !dto.shop_id) {
      throw new ApiError(
        ApiErrorCode.VALIDATION_FAILED,
        'A product without a barcode must belong to a shop — send shop_id',
        400,
        [{ field: 'shop_id', issue: 'required when barcode is omitted' }],
      );
    }

    if (dto.barcode) {
      const existing = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
        select: { id: true },
      });
      if (existing) return { created: false, product: await this.get(existing.id) };
    }

    const created = await this.prisma.product.create({
      data: {
        barcode: dto.barcode,
        name: dto.name,
        brand: dto.brand,
        unitSize: dto.unit_size,
        categoryId: dto.category_id,
        imageUrl: dto.image_url,
        createdByShopId: dto.barcode ? null : dto.shop_id,
      },
    });

    return { created: true, product: await this.get(created.id) };
  }

  /** The POS hot path. One round trip per scan. */
  async byBarcode(barcode: string, shopId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: { category: true },
    });
    if (!product) {
      throw new ApiError(
        ApiErrorCode.PRODUCT_NOT_FOUND,
        `No product matches barcode ${barcode}`,
        404,
      );
    }

    let shopProduct: {
      id: string;
      price_cents: number;
      stock_qty: number;
      low_stock_threshold: number;
      is_available: boolean;
    } | null = null;
    if (shopId) {
      const sp = await this.prisma.shopProduct.findUnique({
        where: { shopId_productId: { shopId, productId: product.id } },
      });
      if (sp) {
        shopProduct = {
          id: sp.id,
          price_cents: Number(sp.priceCents),
          stock_qty: sp.stockQty,
          low_stock_threshold: sp.lowStockThreshold,
          is_available: sp.isAvailable,
        };
      }
    }

    return { product: presentProduct(product), shop_product: shopProduct };
  }
}
