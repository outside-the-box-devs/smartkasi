import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import type { AuthUser } from '../../common/types/auth.types';
import { paginate } from '../../common/dto/pagination.dto';
import { boxWhere, haversineM } from '../../common/geo';
import { isOpenNow, timeToHHMM } from '../../common/time';
import { ShopAccessService } from './shop-access.service';
import { CreateShopDto, ListShopsQuery, SubmitLicenceDto, UpdateShopDto } from './dto';
import type { Prisma, Shop } from '../../generated/prisma/client';

type ShopWithCount = Shop & { _count?: { shopProducts: number } };

@Injectable()
export class ShopsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ShopAccessService,
  ) {}

  /**
   * Geo search without PostGIS: bounding box in the database (which uses the
   * (lat, lng) index), exact haversine here, then sort and page in memory.
   *
   * The in-memory page is the honest cost of dropping PostGIS. At tens or
   * hundreds of shops it is nothing. If the shop count ever reaches thousands,
   * this is the first query to move back to SQL.
   */
  async list(q: ListShopsQuery) {
    const where: Prisma.ShopWhereInput = { isActive: true };

    if (q.q) where.name = { contains: q.q, mode: 'insensitive' };
    if (q.accepts_orders !== undefined) where.acceptsOrders = q.accepts_orders;

    const hasPoint = q.lat !== undefined && q.lng !== undefined;
    if (hasPoint) Object.assign(where, boxWhere(q.lat!, q.lng!, q.radius_m));

    if (!hasPoint && !q.open_now) {
      const [total, rows] = await Promise.all([
        this.prisma.shop.count({ where }),
        this.prisma.shop.findMany({
          where,
          orderBy: { name: 'asc' },
          skip: q.offset,
          take: q.per_page,
        }),
      ]);
      return paginate(rows.map((r) => this.summary(r, null)), total, q);
    }

    const rows = await this.prisma.shop.findMany({ where, orderBy: { name: 'asc' } });

    let withDistance = rows.map((r) => ({
      row: r,
      distance: hasPoint ? haversineM(q.lat!, q.lng!, r.lat, r.lng) : null,
    }));

    // The bounding box over-selects the corners of the square; this trims it
    // back to an actual circle.
    if (hasPoint) {
      withDistance = withDistance.filter((r) => (r.distance ?? 0) <= q.radius_m);
      withDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    }
    if (q.open_now) {
      withDistance = withDistance.filter((r) => isOpenNow(r.row.opensAt, r.row.closesAt));
    }

    const page = withDistance.slice(q.offset, q.offset + q.per_page);
    return paginate(
      page.map((r) => this.summary(r.row, r.distance)),
      withDistance.length,
      q,
    );
  }

  async get(shopId: string) {
    const row = await this.prisma.shop.findUnique({
      where: { id: shopId },
      include: { _count: { select: { shopProducts: true } } },
    });
    if (!row) throw ApiError.notFound('Shop');
    return this.detail(row);
  }

  async create(user: AuthUser, dto: CreateShopDto) {
    const slug = await this.uniqueSlug(dto.name);

    const shop = await this.prisma.$transaction(async (tx) => {
      const created = await tx.shop.create({
        data: {
          ownerId: user.id,
          name: dto.name,
          slug,
          description: dto.description,
          phone: dto.phone,
          lat: dto.lat,
          lng: dto.lng,
          addressLine: dto.address_line,
          township: dto.township,
          city: dto.city,
          province: dto.province,
          opensAt: parseTime(dto.opens_at),
          closesAt: parseTime(dto.closes_at),
        },
      });

      // Registering a shop promotes a customer to shop owner.
      await tx.profile.updateMany({
        where: { id: user.id, role: 'customer' },
        data: { role: 'shop_owner' },
      });

      return created;
    });

    return this.get(shop.id);
  }

  async update(user: AuthUser, shopId: string, dto: UpdateShopDto) {
    const perms = await this.access.require(user, shopId);
    if (!perms.isOwner) throw ApiError.forbidden('Only the owner can change shop settings');

    if (dto.accepts_orders === true) {
      const shop = await this.prisma.shop.findUnique({
        where: { id: shopId },
        select: { licenceStatus: true },
      });
      if (shop?.licenceStatus !== 'verified') {
        throw ApiError.unprocessable(
          ApiErrorCode.LICENCE_NOT_VERIFIED,
          'A verified trading licence is required before this shop can accept orders',
          [{ field: 'accepts_orders', issue: `licence_status is '${shop?.licenceStatus}'` }],
        );
      }
    }

    await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        name: dto.name,
        description: dto.description,
        phone: dto.phone,
        logoUrl: dto.logo_url,
        addressLine: dto.address_line,
        lat: dto.lat,
        lng: dto.lng,
        opensAt: parseTime(dto.opens_at),
        closesAt: parseTime(dto.closes_at),
        mode: dto.mode,
        acceptsOrders: dto.accepts_orders,
        acceptsDelivery: dto.accepts_delivery,
        isActive: dto.is_active,
      },
    });

    return this.get(shopId);
  }

  async submitLicence(user: AuthUser, shopId: string, dto: SubmitLicenceDto) {
    const perms = await this.access.require(user, shopId);
    if (!perms.isOwner) throw ApiError.forbidden('Only the owner can submit a licence');

    await this.prisma.shop.update({
      where: { id: shopId },
      data: {
        tradingLicenceNo: dto.trading_licence_no,
        licenceDocUrl: dto.licence_doc_url,
        licenceExpiresAt: dto.licence_expires_at ? new Date(dto.licence_expires_at) : undefined,
        licenceStatus: 'pending',
      },
    });

    return this.get(shopId);
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base =
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'shop';
    for (let i = 0; i < 50; i++) {
      const candidate = i === 0 ? base : `${base}-${i + 1}`;
      const clash = await this.prisma.shop.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!clash) return candidate;
    }
    return `${base}-${Date.now()}`;
  }

  private summary(r: Shop, distanceM: number | null) {
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      logo_url: r.logoUrl,
      address_line: r.addressLine,
      township: r.township,
      city: r.city,
      lat: r.lat,
      lng: r.lng,
      distance_m: distanceM,
      mode: r.mode,
      accepts_orders: r.acceptsOrders,
      accepts_delivery: r.acceptsDelivery,
      is_open_now: isOpenNow(r.opensAt, r.closesAt),
    };
  }

  private detail(r: ShopWithCount) {
    return {
      ...this.summary(r, null),
      owner_id: r.ownerId,
      description: r.description,
      phone: r.phone,
      province: r.province,
      trading_licence_no: r.tradingLicenceNo,
      licence_status: r.licenceStatus,
      licence_expires_at: r.licenceExpiresAt?.toISOString().slice(0, 10) ?? null,
      opens_at: timeToHHMM(r.opensAt),
      closes_at: timeToHHMM(r.closesAt),
      is_active: r.isActive,
      product_count: r._count?.shopProducts ?? 0,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    };
  }
}

/**
 * Postgres `time` maps to a JS Date pinned at 1970-01-01 UTC. Building it any
 * other way silently shifts the shop's opening hours by the server's offset.
 */
function parseTime(value?: string): Date | undefined {
  if (!value) return undefined;
  const [h, m] = value.split(':');
  return new Date(Date.UTC(1970, 0, 1, Number(h), Number(m ?? 0), 0));
}
