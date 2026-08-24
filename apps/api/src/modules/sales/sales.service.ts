import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import { paginate } from '../../common/dto/pagination.dto';
import type { AuthUser } from '../../common/types/auth.types';
import { saDayRangeUtc, saToday } from '../../common/time';
import { ShopAccessService } from '../shops/shop-access.service';
import {
  BatchSalesDto,
  CreateSaleDto,
  DailyReportQuery,
  ListSalesQuery,
  VoidSaleDto,
} from './dto';
import type {
  Prisma,
  Profile,
  Sale,
  SaleItem,
} from '../../generated/prisma/client';

type SaleWithItems = Sale & { items: SaleItem[]; cashier: Profile | null };

/**
 * POS sales.
 *
 * The whole offline story lives here and it is deliberately small:
 * `@@unique([shopId, clientSaleId])` means a replayed batch produces one sale.
 * There is no sync engine, no vector clock, no merge algorithm. Resist adding
 * one — every extra mechanism here is a new way to lose a day's takings.
 */
@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ShopAccessService,
  ) {}

  async create(user: AuthUser, shopId: string, dto: CreateSaleDto) {
    await this.access.require(user, shopId);
    const outcome = await this.insertOne(user, shopId, dto);
    return {
      duplicate: outcome.duplicate,
      sale: await this.get(user, shopId, outcome.saleId, true),
    };
  }

  /**
   * Offline flush. Partial success is the NORMAL case — one malformed sale must
   * never block a week of takings, so each sale is its own transaction and its
   * own result row.
   */
  async batch(user: AuthUser, shopId: string, dto: BatchSalesDto) {
    await this.access.require(user, shopId);

    const results: Array<{
      client_sale_id: string;
      status: 'created' | 'duplicate' | 'failed';
      sale_id: string | null;
      error?: { code: string; message: string };
    }> = [];

    for (const sale of dto.sales) {
      try {
        const outcome = await this.insertOne(user, shopId, sale);
        results.push({
          client_sale_id: sale.client_sale_id,
          status: outcome.duplicate ? 'duplicate' : 'created',
          sale_id: outcome.saleId,
        });
      } catch (err) {
        this.logger.warn(
          `batch sale ${sale.client_sale_id} failed: ${String(err)}`,
        );
        results.push({
          client_sale_id: sale.client_sale_id,
          status: 'failed',
          sale_id: null,
          error: {
            code:
              err instanceof ApiError ? err.code : ApiErrorCode.INTERNAL_ERROR,
            message: err instanceof Error ? err.message : 'Unknown error',
          },
        });
      }
    }

    return {
      server_time: new Date().toISOString(),
      summary: {
        created: results.filter((r) => r.status === 'created').length,
        duplicate: results.filter((r) => r.status === 'duplicate').length,
        failed: results.filter((r) => r.status === 'failed').length,
      },
      results,
    };
  }

  private async insertOne(
    user: AuthUser,
    shopId: string,
    dto: CreateSaleDto,
  ): Promise<{ saleId: string; duplicate: boolean }> {
    this.assertTotals(dto);

    // Fast path: already synced. Checked before opening a transaction so a
    // repeated flush of 200 sales stays cheap.
    const existing = await this.prisma.sale.findUnique({
      where: {
        shopId_clientSaleId: { shopId, clientSaleId: dto.client_sale_id },
      },
      select: { id: true },
    });
    if (existing) return { saleId: existing.id, duplicate: true };

    const productIds = [...new Set(dto.items.map((i) => i.product_id))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(products.map((p) => [p.id, p.name]));

    const missing = productIds.filter((id) => !nameById.has(id));
    if (missing.length) {
      throw new ApiError(
        ApiErrorCode.PRODUCT_NOT_FOUND,
        `Unknown product ${missing[0]}`,
        422,
        missing.map((id) => ({
          field: 'items[].product_id',
          issue: `unknown product ${id}`,
        })),
      );
    }

    try {
      const sale = await this.prisma.$transaction(async (tx) => {
        const created = await tx.sale.create({
          data: {
            shopId,
            clientSaleId: dto.client_sale_id,
            cashierId: user.id,
            subtotalCents: BigInt(dto.subtotal_cents),
            discountCents: BigInt(dto.discount_cents),
            totalCents: BigInt(dto.total_cents),
            amountTenderedCents:
              dto.amount_tendered_cents === undefined
                ? null
                : BigInt(dto.amount_tendered_cents),
            changeCents:
              dto.change_cents === undefined ? null : BigInt(dto.change_cents),
            paymentMethod: dto.payment_method,
            soldAt: new Date(dto.sold_at),
            items: {
              create: dto.items.map((item) => ({
                productId: item.product_id,
                productName: nameById.get(item.product_id)!,
                qty: item.qty,
                unitPriceCents: BigInt(item.unit_price_cents),
                lineTotalCents: BigInt(item.qty * item.unit_price_cents),
              })),
            },
          },
        });

        // Stock goes NEGATIVE rather than being blocked. A spaza that sold its
        // last tin while offline has sold it; refusing the write would lose
        // real money in exchange for a tidy number. Negative stock is a signal
        // for the owner to count, not an error for the cashier.
        await tx.stockMovement.createMany({
          data: dto.items.map((item) => ({
            shopId,
            productId: item.product_id,
            delta: -item.qty,
            reason: 'sale' as const,
            refType: 'sale',
            refId: created.id,
            actorId: user.id,
            occurredAt: new Date(dto.sold_at),
          })),
        });

        return created;
      });

      return { saleId: sale.id, duplicate: false };
    } catch (err) {
      // Lost the race against a concurrent flush of the same batch. Still a
      // success — the sale is recorded exactly once, which is the whole point.
      if (isUniqueViolation(err)) {
        const row = await this.prisma.sale.findUnique({
          where: {
            shopId_clientSaleId: { shopId, clientSaleId: dto.client_sale_id },
          },
          select: { id: true },
        });
        if (row) return { saleId: row.id, duplicate: true };
      }
      throw err;
    }
  }

  private assertTotals(dto: CreateSaleDto): void {
    const expected = dto.subtotal_cents - dto.discount_cents;
    if (expected !== dto.total_cents) {
      throw ApiError.unprocessable(
        ApiErrorCode.TOTALS_MISMATCH,
        `total_cents ${dto.total_cents} does not equal subtotal ${dto.subtotal_cents} minus discount ${dto.discount_cents}`,
        [{ field: 'total_cents', issue: `expected ${expected}` }],
      );
    }

    const lineSum = dto.items.reduce(
      (sum, i) => sum + i.qty * i.unit_price_cents,
      0,
    );
    if (lineSum !== dto.subtotal_cents) {
      throw ApiError.unprocessable(
        ApiErrorCode.TOTALS_MISMATCH,
        `subtotal_cents ${dto.subtotal_cents} does not equal the sum of line items ${lineSum}`,
        [{ field: 'subtotal_cents', issue: `expected ${lineSum}` }],
      );
    }
  }

  async list(user: AuthUser, shopId: string, q: ListSalesQuery) {
    await this.access.require(user, shopId);

    const where: Prisma.SaleWhereInput = { shopId };
    if (q.from || q.to) {
      where.soldAt = {
        ...(q.from ? { gte: new Date(q.from) } : {}),
        ...(q.to ? { lte: new Date(q.to) } : {}),
      };
    }
    if (q.cashier_id) where.cashierId = q.cashier_id;

    const [total, rows] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.findMany({
        where,
        include: { items: true, cashier: true },
        orderBy: { soldAt: 'desc' },
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

  async get(
    user: AuthUser,
    shopId: string,
    saleId: string,
    skipAccessCheck = false,
  ) {
    if (!skipAccessCheck) await this.access.require(user, shopId);

    const row = await this.prisma.sale.findFirst({
      where: { id: saleId, shopId },
      include: { items: true, cashier: true },
    });
    if (!row) throw ApiError.notFound('Sale');
    return this.present(row);
  }

  /** Voids are compensating entries, never deletes. A void must be auditable. */
  async void(user: AuthUser, shopId: string, saleId: string, dto: VoidSaleDto) {
    const perms = await this.access.require(user, shopId);
    if (!perms.canVoidSales)
      throw ApiError.forbidden('You are not allowed to void sales');

    await this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, shopId },
        include: { items: true },
      });
      if (!sale) throw ApiError.notFound('Sale');
      if (sale.status === 'voided') return;

      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'voided' },
      });

      await tx.stockMovement.createMany({
        data: sale.items.map((item) => ({
          shopId,
          productId: item.productId,
          delta: item.qty,
          reason: 'void' as const,
          refType: 'sale',
          refId: saleId,
          actorId: user.id,
          occurredAt: new Date(),
          note: dto.reason,
        })),
      });
    });

    return this.get(user, shopId, saleId, true);
  }

  /** The cash-up screen. */
  async dailyReport(user: AuthUser, shopId: string, q: DailyReportQuery) {
    await this.access.require(user, shopId);

    const date = q.date ?? saToday();
    const { from, to } = saDayRangeUtc(date);
    const window = { shopId, soldAt: { gte: from, lt: to } };

    const [completed, voided, byMethod, topItems] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { ...window, status: 'completed' },
        _count: true,
        _sum: { subtotalCents: true, discountCents: true, totalCents: true },
      }),
      this.prisma.sale.count({ where: { ...window, status: 'voided' } }),
      this.prisma.sale.groupBy({
        by: ['paymentMethod'],
        where: { ...window, status: 'completed' },
        _count: true,
        _sum: { totalCents: true },
      }),
      this.prisma.saleItem.groupBy({
        by: ['productId', 'productName'],
        where: { sale: { ...window, status: 'completed' } },
        _sum: { qty: true, lineTotalCents: true },
        orderBy: { _sum: { lineTotalCents: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      date,
      sale_count: completed._count,
      gross_cents: Number(completed._sum.subtotalCents ?? 0),
      discount_cents: Number(completed._sum.discountCents ?? 0),
      net_cents: Number(completed._sum.totalCents ?? 0),
      voided_count: voided,
      by_payment_method: byMethod.map((m) => ({
        method: m.paymentMethod,
        count: m._count,
        total_cents: Number(m._sum.totalCents ?? 0),
      })),
      top_products: topItems.map((p) => ({
        product_id: p.productId,
        name: p.productName,
        qty: p._sum.qty ?? 0,
        total_cents: Number(p._sum.lineTotalCents ?? 0),
      })),
    };
  }

  private present(row: SaleWithItems) {
    return {
      id: row.id,
      shop_id: row.shopId,
      client_sale_id: row.clientSaleId,
      cashier_id: row.cashierId,
      cashier_name: row.cashier?.fullName ?? null,
      status: row.status,
      subtotal_cents: Number(row.subtotalCents),
      discount_cents: Number(row.discountCents),
      total_cents: Number(row.totalCents),
      amount_tendered_cents:
        row.amountTenderedCents === null
          ? null
          : Number(row.amountTenderedCents),
      change_cents: row.changeCents === null ? null : Number(row.changeCents),
      payment_method: row.paymentMethod,
      items: row.items.map((i) => ({
        id: i.id,
        product_id: i.productId,
        product_name: i.productName,
        qty: i.qty,
        unit_price_cents: Number(i.unitPriceCents),
        line_total_cents: Number(i.lineTotalCents),
      })),
      sold_at: row.soldAt.toISOString(),
      synced_at: row.syncedAt.toISOString(),
    };
  }
}

/** Prisma reports a unique-constraint violation as P2002. */
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { code?: string }).code === 'P2002'
  );
}
