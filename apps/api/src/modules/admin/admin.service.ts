import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError } from '../../common/errors/api-error';
import type { UserRole } from '../../common/types/auth.types';
import type { Profile } from '../../generated/prisma/client';
import { paginate } from '../../common/dto/pagination.dto';
import { CourierProfileService } from '../delivery/courier-profile.service';
import type { VerifyCourierDto } from '../delivery/dto';
import { ShopsService } from '../shops/shops.service';
import type { SetLicenceStatusDto } from '../shops/dto';
import {
  ListCourierQueueQuery,
  ListLicenceQueueQuery,
  SetRoleDto,
} from './dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    // Both writes live in the service that owns the record rather than here.
    // This class is the admin *surface*; what `is_verified` and
    // `licence_status` mean is domain knowledge, and duplicating it behind an
    // admin route is how the two copies start disagreeing.
    private readonly couriers: CourierProfileService,
    private readonly shops: ShopsService,
  ) {}

  /**
   * The only way to change a role. profiles.role is what
   * public.custom_access_token_hook reads when GoTrue mints a token, so this
   * write is what actually moves someone between apps.
   *
   * It takes effect on the user's NEXT token, not their current one — an access
   * token already on a phone keeps the old role until it expires or refreshes
   * (jwt_expiry 3600s). Demoting someone is therefore not instant, which is
   * worth knowing before treating this as a revocation mechanism.
   */
  async setRole(userId: string, dto: SetRoleDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!existing) throw ApiError.notFound('User');

    const profile = await this.prisma.profile.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    return this.present(profile, existing.role);
  }

  /**
   * The courier review queue.
   *
   * `id_doc_url` is in the row because reviewing IS looking at that document,
   * and this response only ever goes to an admin. It must not be copied into
   * any other listing — see the privacy split in delivery.presenter.ts.
   */
  async listCouriers(q: ListCourierQueueQuery) {
    const where =
      q.status === 'all' ? {} : { isVerified: q.status === 'verified' };

    const [total, rows] = await Promise.all([
      this.prisma.courier.count({ where }),
      this.prisma.courier.findMany({
        where,
        include: { profile: true },
        // Oldest first: a queue an operator works from the top of should not
        // bury the person who has been waiting longest under this morning.
        orderBy: { createdAt: 'asc' },
        skip: q.offset,
        take: q.per_page,
      }),
    ]);

    return paginate(
      rows.map((c) => ({
        id: c.id,
        full_name: c.profile.fullName,
        phone: c.profile.phone,
        mode: c.mode,
        max_radius_m: c.maxRadiusM,
        vehicle_reg: c.vehicleReg,
        id_doc_url: c.idDocUrl,
        verification_status: c.isVerified ? 'verified' : 'pending',
        is_verified: c.isVerified,
        is_online: c.isOnline,
        applied_at: c.createdAt.toISOString(),
      })),
      total,
      q,
    );
  }

  /** Approve, reject or revoke a courier application. */
  verifyCourier(courierId: string, dto: VerifyCourierDto) {
    return this.couriers.setVerified(courierId, dto.is_verified);
  }

  /**
   * The trading-licence queue. Unlike `GET /shops` this ignores `is_active`:
   * a shop that deactivated itself while waiting for review is still a shop
   * whose licence needs a decision.
   */
  async listShops(q: ListLicenceQueueQuery) {
    const where =
      q.licence_status === 'all' ? {} : { licenceStatus: q.licence_status };

    const [total, rows] = await Promise.all([
      this.prisma.shop.count({ where }),
      this.prisma.shop.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: q.offset,
        take: q.per_page,
      }),
    ]);

    return paginate(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        owner_id: r.ownerId,
        township: r.township,
        city: r.city,
        trading_licence_no: r.tradingLicenceNo,
        licence_status: r.licenceStatus,
        licence_doc_url: r.licenceDocUrl,
        licence_expires_at:
          r.licenceExpiresAt?.toISOString().slice(0, 10) ?? null,
        mode: r.mode,
        accepts_orders: r.acceptsOrders,
        is_active: r.isActive,
        created_at: r.createdAt.toISOString(),
      })),
      total,
      q,
    );
  }

  /** Accept or refuse a submitted trading licence. */
  setLicenceStatus(shopId: string, dto: SetLicenceStatusDto) {
    return this.shops.setLicenceStatus(shopId, dto);
  }

  private present(p: Profile, previousRole: UserRole) {
    return {
      id: p.id,
      role: p.role,
      previous_role: previousRole,
      full_name: p.fullName,
      phone: p.phone,
      // Says out loud what the caller almost certainly wants to know next.
      takes_effect: 'on the next token this user is issued',
      updated_at: p.updatedAt.toISOString(),
    };
  }
}
