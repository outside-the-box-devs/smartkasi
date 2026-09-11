import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum CourierModeDto {
  foot = 'foot',
  bicycle = 'bicycle',
  vehicle = 'vehicle',
}

/**
 * Absolute bounds, not the real limit. The per-mode cap in
 * delivery.presenter.ts (`MODE_MAX_RADIUS_M`) is what actually applies and is
 * enforced in the service — a foot courier asking for 10 km gets a 422 naming
 * the cap rather than a silently clamped row that lies back to them.
 */
const RADIUS_FLOOR_M = 250;
const RADIUS_CEILING_M = 50_000;

export class ApplyCourierDto {
  @IsEnum(CourierModeDto)
  mode: CourierModeDto;

  /** Omitted means the default for the mode — see `DEFAULT_RADIUS_M`. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(RADIUS_FLOOR_M)
  @Max(RADIUS_CEILING_M)
  max_radius_m?: number;

  /**
   * Required for `vehicle`, refused for the other two — a foot courier has no
   * registration and storing one would put an unverifiable string in front of
   * whoever reviews the application.
   */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Za-z0-9 -]+$/, {
    message: 'vehicle_reg may contain only letters, digits, spaces and hyphens',
  })
  vehicle_reg?: string;

  /**
   * Required. Verification is a human reading an ID document, so an
   * application without one is an application nobody can action. Upload it via
   * POST /uploads/presign with purpose `courier_id_doc`, then send the
   * `public_url` back here.
   */
  @IsUrl({ require_tld: false })
  id_doc_url: string;
}

/**
 * Everything here is optional; anything omitted is left as it is. Note that
 * `mode`, `vehicle_reg` and `id_doc_url` are the verification-bearing fields —
 * changing one of them sends the account back to unverified. `max_radius_m`
 * does not.
 */
export class UpdateCourierDto {
  @IsOptional()
  @IsEnum(CourierModeDto)
  mode?: CourierModeDto;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(RADIUS_FLOOR_M)
  @Max(RADIUS_CEILING_M)
  max_radius_m?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Za-z0-9 -]+$/, {
    message: 'vehicle_reg may contain only letters, digits, spaces and hyphens',
  })
  vehicle_reg?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  id_doc_url?: string;
}

export class RequestDeliveryDto {
  /**
   * A hint, not a booking. It is stored on `deliveries.mode` so only couriers
   * on that mode are offered the job; the accepting courier's actual mode then
   * overwrites it. Omit it and every mode sees the job.
   */
  @IsOptional()
  @IsEnum(CourierModeDto)
  preferred_mode?: CourierModeDto;
}

export class CollectJobDto {
  /**
   * Optional, and the contract says so.
   *
   * It was originally required, but the courier app ships a plain "Collected"
   * button and sends an empty body — with `forbidNonWhitelisted` on, requiring
   * it here would 400 every pickup in the field. Omitted means "the next
   * uncollected stop in sequence", which is what that button means anyway.
   */
  @IsOptional()
  @IsUUID()
  shop_id?: string;
}

export class DeliverJobDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  proof_photo_url?: string;

  /**
   * Checked against the order total rather than stored — v1 is cash on
   * handover, and a courier arriving short is a conversation to have at the
   * gate, not a number to file silently.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cash_collected_cents?: number;
}
