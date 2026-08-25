import { HttpStatus, Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma.service';
import { ApiError, ApiErrorCode } from '../../common/errors/api-error';
import type { AuthUser } from '../../common/types/auth.types';
import { MODE_MAX_RADIUS_M } from './delivery.presenter';
import { ApplyCourierDto, UpdateCourierDto } from './dto';
import type { Courier, CourierMode } from '../../generated/prisma/client';

/**
 * Sensible starting reach per mode. The column default is 2000 for everyone,
 * which is right for foot and bicycle and absurd for a car — a driver who
 * accepts nothing beyond 2 km is a driver who sees almost no board.
 */
const DEFAULT_RADIUS_M: Record<CourierMode, number> = {
  foot: 2000,
  bicycle: 2000,
  vehicle: 5000,
};

/**
 * Fields a human reviewed when they ticked `is_verified`. Changing any of them
 * invalidates that review, so the account goes back to pending.
 *
 * This is the whole reason onboarding is not "just an upsert": without it,
 * getting verified once as a foot courier and then PATCHing `mode` to
 * `vehicle` is a self-service promotion past the vehicle checks. `max_radius_m`
 * is deliberately not on this list — it is the courier's own preference and
 * nobody reviews it, so nudging it must not cost them their verification.
 */
const VERIFICATION_BEARING = ['mode', 'vehicle_reg', 'id_doc_url'] as const;

/**
 * Courier self-service: apply, keep your own details current, go online and
 * offline.
 *
 * Authorisation here is the `couriers` row, not the `courier` role claim, and
 * that is deliberate on two counts:
 *
 *   1. The row is the stronger fact. Being handed the role does not register
 *      you as a courier — `DeliveryService.requireCourier` already refuses a
 *      roled user with no row, and the smoke suite asserts exactly that.
 *   2. The claim is stale at precisely the wrong moment. Applying writes
 *      `profiles.role`, but the caller is still holding the token they had a
 *      second ago, and `custom_access_token_hook` only runs when the NEXT one
 *      is minted. A `@Roles('courier')` gate on `POST /courier/online` would
 *      403 every courier for up to an hour after they applied.
 *
 * Every route here reads and writes only the caller's own row, so there is no
 * third party's data behind the gate. The job endpoints in CourierController
 * are a different matter — those carry customer addresses and phone numbers
 * and keep their role gate.
 */
@Injectable()
export class CourierProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Apply, or re-submit an existing application.
   *
   * Idempotent by user id rather than 409-ing a second submission: a courier
   * whose first ID photo was unreadable has to be able to send another one,
   * and there is nothing to gain from making that a different endpoint.
   *
   * Never sets `is_verified`. Verification is a platform action behind the
   * `admin` role — see docs/API_CONTRACT.md § 8 and the operator console.
   */
  async apply(user: AuthUser, dto: ApplyCourierDto) {
    const mode = dto.mode as CourierMode;
    const radius = dto.max_radius_m ?? DEFAULT_RADIUS_M[mode];
    assertRadiusFitsMode(mode, radius);
    const vehicleReg = normaliseVehicleReg(mode, dto.vehicle_reg);

    const existing = await this.prisma.courier.findUnique({
      where: { id: user.id },
    });
    const resets =
      existing !== null &&
      existing.isVerified &&
      changedVerificationFields(existing, {
        mode,
        vehicleReg,
        idDocUrl: dto.id_doc_url,
      }).length > 0;

    const row = await this.prisma.$transaction(async (tx) => {
      // The `t_on_auth_user_created` trigger normally creates the profile, but
      // MeService does not trust it either — an account made before that
      // trigger existed would otherwise hit a bare FK violation here.
      await tx.profile.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          fullName: user.email?.split('@')[0] ?? 'SmartKasi user',
        },
      });

      const saved = await tx.courier.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          mode,
          maxRadiusM: radius,
          vehicleReg,
          idDocUrl: dto.id_doc_url,
          // Both spelled out rather than left to the column defaults, so that
          // "applying never grants either of these" is visible in this file.
          isVerified: false,
          isOnline: false,
        },
        update: {
          mode,
          maxRadiusM: radius,
          vehicleReg,
          idDocUrl: dto.id_doc_url,
          ...(resets ? { isVerified: false } : {}),
        },
      });

      // Registering as a courier promotes a customer, exactly as registering a
      // shop promotes one to shop_owner. Scoped to `customer` on purpose: a
      // shop owner who signs up to courier keeps the role their shop needs
      // rather than being silently locked out of their own till.
      await tx.profile.updateMany({
        where: { id: user.id, role: 'customer' },
        data: { role: 'courier' },
      });

      return saved;
    });

    return this.present(row, { verificationReset: resets });
  }

  /** The courier's own record. 404 is the app's cue to show the apply form. */
  async get(user: AuthUser) {
    return this.present(await this.require(user.id));
  }

  /**
   * Partial update. Sending nothing is allowed and is a no-op read — the
   * courier app's settings screen submits the whole form either way.
   */
  async update(user: AuthUser, dto: UpdateCourierDto) {
    const current = await this.require(user.id);

    const mode = (dto.mode as CourierMode | undefined) ?? current.mode;
    const radius = dto.max_radius_m ?? current.maxRadiusM;
    assertRadiusFitsMode(mode, radius);

    // Re-derived from the merged mode, not from `dto`: switching vehicle -> foot
    // without touching vehicle_reg must still clear the stale registration.
    const vehicleReg = normaliseVehicleReg(
      mode,
      dto.vehicle_reg ?? current.vehicleReg ?? undefined,
    );
    const idDocUrl = dto.id_doc_url ?? current.idDocUrl;

    const changed = changedVerificationFields(current, {
      mode,
      vehicleReg,
      idDocUrl,
    });
    const resets = current.isVerified && changed.length > 0;

    const row = await this.prisma.courier.update({
      where: { id: user.id },
      data: {
        mode,
        maxRadiusM: radius,
        vehicleReg,
        idDocUrl,
        ...(resets ? { isVerified: false } : {}),
      },
    });

    return this.present(row, {
      verificationReset: resets,
      verificationResetBy: resets ? changed : undefined,
    });
  }

  /**
   * Go online / go offline.
   *
   * Works whether or not the account is verified. `is_online` is the courier's
   * own statement of availability; `is_verified` is the platform's gate, and
   * `DeliveryService.requireCourier` checks both. Keeping them independent
   * means a courier who flipped the switch on the day they applied starts
   * seeing work the moment they are approved, instead of having to guess that
   * they need to toggle it again.
   */
  async setAvailability(user: AuthUser, isOnline: boolean) {
    await this.require(user.id);
    const row = await this.prisma.courier.update({
      where: { id: user.id },
      data: { isOnline },
    });
    return this.present(row);
  }

  private async require(userId: string): Promise<Courier> {
    const row = await this.prisma.courier.findUnique({ where: { id: userId } });
    if (!row) {
      // Not `forbidden`: nothing is being withheld, the record does not exist
      // yet. The message names the way in, because a 404 with no next step is
      // the same dead end this ticket is about.
      throw new ApiError(
        ApiErrorCode.NOT_FOUND,
        'You are not registered as a courier — apply with POST /courier/application',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  /**
   * Built field by field. `id_doc_url` is in here because this shape only ever
   * goes back to the courier who owns it (or an admin); it must not be copied
   * into any list, board or delivery response.
   */
  private present(
    c: Courier,
    extra: {
      verificationReset?: boolean;
      verificationResetBy?: readonly string[];
    } = {},
  ) {
    const status = c.isVerified ? 'verified' : 'pending';
    return {
      id: c.id,
      mode: c.mode,
      max_radius_m: c.maxRadiusM,
      effective_radius_m: Math.min(c.maxRadiusM, MODE_MAX_RADIUS_M[c.mode]),
      vehicle_reg: c.vehicleReg,
      id_doc_url: c.idDocUrl,
      verification_status: status,
      is_verified: c.isVerified,
      is_online: c.isOnline,
      // Precomputed so the courier app can show one honest line instead of
      // reimplementing requireCourier's precedence and getting it subtly wrong.
      can_receive_jobs: c.isVerified && c.isOnline,
      blocked_reason: c.isVerified
        ? c.isOnline
          ? null
          : 'You are offline'
        : 'Your courier account is not verified yet',
      rating_avg: c.ratingAvg === null ? null : Number(c.ratingAvg),
      verification_reset: extra.verificationReset ?? false,
      verification_reset_by: extra.verificationResetBy ?? null,
      // Says out loud what the caller almost certainly wants to know next, in
      // the same words PATCH /admin/users/{id}/role uses.
      role_takes_effect: 'on the next token this user is issued',
      applied_at: c.createdAt.toISOString(),
    };
  }
}

/**
 * The contract caps foot and bicycle at ~2 km, and the job board silently
 * applies that cap with a `Math.min`. Refusing the write instead means the
 * stored number is one the courier can believe: nobody sets 8 km on foot and
 * then wonders why the board is empty past 2.
 */
function assertRadiusFitsMode(mode: CourierMode, radius: number): void {
  const cap = MODE_MAX_RADIUS_M[mode];
  if (radius > cap) {
    throw ApiError.unprocessable(
      ApiErrorCode.VALIDATION_FAILED,
      `A ${mode} courier's radius is capped at ${cap} m`,
      [{ field: 'max_radius_m', issue: `${radius} exceeds the cap of ${cap}` }],
    );
  }
}

/**
 * A registration belongs to `vehicle` and nowhere else. Requiring it there is
 * what makes the vehicle path reviewable; clearing it elsewhere is what stops a
 * stale plate travelling with a courier who has since switched to a bicycle.
 */
function normaliseVehicleReg(
  mode: CourierMode,
  raw: string | undefined,
): string | null {
  if (mode !== 'vehicle') return null;
  const value = raw?.trim().toUpperCase();
  if (!value) {
    throw ApiError.unprocessable(
      ApiErrorCode.VALIDATION_FAILED,
      'A vehicle courier must supply a vehicle registration',
      [{ field: 'vehicle_reg', issue: 'required when mode is vehicle' }],
    );
  }
  return value;
}

/** Which reviewed fields this write actually changes. Empty means none. */
function changedVerificationFields(
  current: Courier,
  next: {
    mode: CourierMode;
    vehicleReg: string | null;
    idDocUrl: string | null;
  },
): string[] {
  const before: Record<(typeof VERIFICATION_BEARING)[number], unknown> = {
    mode: current.mode,
    vehicle_reg: current.vehicleReg,
    id_doc_url: current.idDocUrl,
  };
  const after: Record<(typeof VERIFICATION_BEARING)[number], unknown> = {
    mode: next.mode,
    vehicle_reg: next.vehicleReg,
    id_doc_url: next.idDocUrl,
  };
  return VERIFICATION_BEARING.filter((f) => before[f] !== after[f]);
}
