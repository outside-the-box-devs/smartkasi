import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import { paginate } from '../../common/dto/pagination.dto';
import type { AuthUser } from '../../common/types/auth.types';
import { ShopAccessService } from '../shops/shop-access.service';
import {
  AddInventoryItemDto,
  BulkUpsertInventoryDto,
  ListInventoryQuery,
  UpdateInventoryItemDto,
} from './dto';
import type {
  Prisma,
  Product,
  ShopProduct,
} from '../../generated/prisma/client';

type InventoryRow = ShopProduct & { product: Product };

export function presentInventory(r: InventoryRow) {
  return {
    id: r.id,
    shop_id: r.shopId,
    price_cents: Number(r.priceCents),
    cost_cents: r.costCents === null ? null : Number(r.costCents),
    stock_qty: r.stockQty,
    low_stock_threshold: r.lowStockThreshold,
    is_available: r.isAvailable,
    is_low_stock: r.stockQty <= r.lowStockThreshold,
    client_updated_at: r.clientUpdatedAt?.toISOString() ?? null,
    updated_at: r.updatedAt.toISOString(),
    product: {
      id: r.product.id,
      barcode: r.product.barcode,
      name: r.product.name,
      brand: r.product.brand,
      unit_size: r.product.unitSize,
      image_url: r.product.imageUrl,
      is_verified: r.product.isVerified,
      updated_at: r.product.updatedAt.toISOString(),
    },
  };
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ShopAccessService,
  ) {}

  async list(user: AuthUser, shopId: string, q: ListInventoryQuery) {
    await this.access.require(user, shopId);

    const where: Prisma.ShopProductWhereInput = { shopId };
    if (q.q) {
      where.product = {
        OR: [
          { name: { contains: q.q, mode: 'insensitive' } },
          { barcode: q.q },
        ],
      };
    }
    if (q.updated_since) where.updatedAt = { gt: new Date(q.updated_since) };

    // Prisma cannot compare two columns in a where clause, so "at or below the
    // threshold" is filtered after the fetch. Fine for one shop's catalog;
    // if a shop ever carries tens of thousands of lines, push this into SQL.
    if (q.low_stock) {
      const all = await this.prisma.shopProduct.findMany({
        where,
        include: { product: true },
        orderBy: { product: { name: 'asc' } },
      });
      const low = all.filter((r) => r.stockQty <= r.lowStockThreshold);
      const page = low.slice(q.offset, q.offset + q.per_page);
      return paginate(page.map(presentInventory), low.length, q);
    }

    const [total, rows] = await Promise.all([
      this.prisma.shopProduct.count({ where }),
      this.prisma.shopProduct.findMany({
        where,
        include: { product: true },
        orderBy: { product: { name: 'asc' } },
        skip: q.offset,
        take: q.per_page,
      }),
    ]);

    return paginate(rows.map(presentInventory), total, q);
  }

  async lowStock(user: AuthUser, shopId: string) {
    await this.access.require(user, shopId);
    const all = await this.prisma.shopProduct.findMany({
      where: { shopId },
      include: { product: true },
      orderBy: [{ stockQty: 'asc' }, { product: { name: 'asc' } }],
    });
    const low = all.filter((r) => r.stockQty <= r.lowStockThreshold);
    return {
      data: low.map(presentInventory),
      meta: {
        total: low.length,
        out_of_stock: low.filter((r) => r.stockQty <= 0).length,
      },
    };
  }

  async add(user: AuthUser, shopId: string, dto: AddInventoryItemDto) {
    await this.access.requireInventoryRights(user, shopId);

    const existing = await this.prisma.shopProduct.findUnique({
      where: { shopId_productId: { shopId, productId: dto.product_id } },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError(
        ApiErrorCode.ALREADY_STOCKED,
        'This shop already stocks that product — use PATCH to change it',
        409,
        [
          {
            field: 'product_id',
            issue: `existing shop_product ${existing.id}`,
          },
        ],
      );
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.shopProduct.create({
        data: {
          shopId,
          productId: dto.product_id,
          priceCents: BigInt(dto.price_cents),
          costCents:
            dto.cost_cents === undefined ? null : BigInt(dto.cost_cents),
          stockQty: 0,
          lowStockThreshold: dto.low_stock_threshold,
        },
      });

      // Opening stock goes through the ledger like every other movement, so the
      // cached counter is never set behind the ledger's back.
      if (dto.stock_qty > 0) {
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: dto.product_id,
            delta: dto.stock_qty,
            reason: 'restock',
            refType: 'manual',
            actorId: user.id,
            occurredAt: new Date(),
            note: 'opening stock',
          },
        });
      }

      return row;
    });

    return this.findOne(created.id);
  }

  /**
   * Last-write-wins on client_updated_at.
   *
   * A till offline for three days must not clobber a price the owner changed on
   * the dashboard yesterday. A rejected stale write returns 409 carrying the
   * WINNING row, so the client overwrites locally instead of retrying forever.
   */
  async update(
    user: AuthUser,
    shopId: string,
    shopProductId: string,
    dto: UpdateInventoryItemDto,
  ) {
    await this.access.requireInventoryRights(user, shopId);

    const current = await this.prisma.shopProduct.findFirst({
      where: { id: shopProductId, shopId },
      select: { productId: true, stockQty: true, clientUpdatedAt: true },
    });
    if (!current) throw ApiError.notFound('Inventory item');

    if (
      dto.client_updated_at &&
      current.clientUpdatedAt &&
      new Date(dto.client_updated_at) < current.clientUpdatedAt
    ) {
      throw new ApiError(
        ApiErrorCode.STALE_WRITE,
        'A newer update already applied — take the returned row as authoritative',
        409,
        [{ field: 'client_updated_at', issue: 'older than the stored value' }],
      ).withPayload(await this.findOne(shopProductId));
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.shopProduct.update({
        where: { id: shopProductId },
        data: {
          priceCents:
            dto.price_cents === undefined ? undefined : BigInt(dto.price_cents),
          costCents:
            dto.cost_cents === undefined ? undefined : BigInt(dto.cost_cents),
          lowStockThreshold: dto.low_stock_threshold,
          isAvailable: dto.is_available,
          clientUpdatedAt: dto.client_updated_at
            ? new Date(dto.client_updated_at)
            : undefined,
        },
      });

      // Setting stock writes an adjustment for the DIFFERENCE. The counter is
      // never overwritten directly — "why is my stock wrong?" has to stay a
      // query, not a mystery.
      if (dto.stock_qty !== undefined && dto.stock_qty !== current.stockQty) {
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: current.productId,
            delta: dto.stock_qty - current.stockQty,
            reason: 'adjustment',
            refType: 'manual',
            actorId: user.id,
            occurredAt: new Date(),
            note: 'manual stock set',
          },
        });
      }
    });

    return this.findOne(shopProductId);
  }

  /** Offline flush. Per-item results, never all-or-nothing. */
  async bulkUpsert(
    user: AuthUser,
    shopId: string,
    dto: BulkUpsertInventoryDto,
  ) {
    await this.access.requireInventoryRights(user, shopId);

    const results: Array<{
      product_id: string;
      status: 'created' | 'updated' | 'skipped_stale' | 'failed';
      shop_product_id: string | null;
      error?: { code: string; message: string };
    }> = [];

    for (const item of dto.items) {
      try {
        const existing = await this.prisma.shopProduct.findUnique({
          where: { shopId_productId: { shopId, productId: item.product_id } },
          select: { id: true, clientUpdatedAt: true },
        });

        if (!existing) {
          const created = await this.add(user, shopId, {
            product_id: item.product_id,
            price_cents: item.price_cents,
            stock_qty: item.stock_qty ?? 0,
            low_stock_threshold: item.low_stock_threshold ?? 5,
          });
          results.push({
            product_id: item.product_id,
            status: 'created',
            shop_product_id: created.id,
          });
          continue;
        }

        if (
          existing.clientUpdatedAt &&
          new Date(item.client_updated_at) < existing.clientUpdatedAt
        ) {
          results.push({
            product_id: item.product_id,
            status: 'skipped_stale',
            shop_product_id: existing.id,
          });
          continue;
        }

        await this.update(user, shopId, existing.id, {
          price_cents: item.price_cents,
          stock_qty: item.stock_qty,
          low_stock_threshold: item.low_stock_threshold,
          is_available: item.is_available,
          client_updated_at: item.client_updated_at,
        });
        results.push({
          product_id: item.product_id,
          status: 'updated',
          shop_product_id: existing.id,
        });
      } catch (err) {
        results.push({
          product_id: item.product_id,
          status: 'failed',
          shop_product_id: null,
          error: {
            code:
              err instanceof ApiError ? err.code : ApiErrorCode.INTERNAL_ERROR,
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }

    return { server_time: new Date().toISOString(), results };
  }

  private async findOne(shopProductId: string) {
    const row = await this.prisma.shopProduct.findUnique({
      where: { id: shopProductId },
      include: { product: true },
    });
    if (!row) throw ApiError.notFound('Inventory item');
    return presentInventory(row);
  }
}
