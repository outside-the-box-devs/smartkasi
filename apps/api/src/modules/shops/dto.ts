import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { GeoQuery } from '../../common/dto/geo.dto';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export enum ShopMode {
  advertising_only = 'advertising_only',
  inventory_only = 'inventory_only',
  full = 'full',
}

export class ListShopsQuery extends PaginationQuery {
  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @Type(() => Number) radius_m = 2000;

  @IsOptional() @IsString() q?: string;

  /** `owner_id=me` scopes the listing to the authenticated caller's shops
   *  (dashboard view). Ignored on unauthenticated calls. */
  @IsOptional() @IsString() owner_id?: string;

  @IsOptional() @Type(() => Boolean) @IsBoolean() accepts_orders?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() open_now?: boolean;
}

export class CreateShopDto {
  @IsString() @MaxLength(120) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() @MaxLength(240) address_line: string;
  @IsOptional() @IsString() township?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() province?: string;
  @Type(() => Number) @IsLatitude() lat: number;
  @Type(() => Number) @IsLongitude() lng: number;
  @IsOptional() @IsString() opens_at?: string;
  @IsOptional() @IsString() closes_at?: string;
  @IsOptional() @IsEnum(ShopMode) mode?: ShopMode;
  @IsOptional() @Type(() => Boolean) @IsBoolean() is_active?: boolean;
}

export class UpdateShopDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUrl() logo_url?: string;
  @IsOptional() @IsString() address_line?: string;
  @IsOptional() @IsString() township?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @IsString() opens_at?: string;
  @IsOptional() @IsString() closes_at?: string;
  @IsOptional() @IsEnum(ShopMode) mode?: ShopMode;
  @IsOptional() @Type(() => Boolean) @IsBoolean() accepts_orders?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() accepts_delivery?: boolean;
  @IsOptional() @Type(() => Boolean) @IsBoolean() is_active?: boolean;
}

export class SubmitLicenceDto {
  @IsString() @MaxLength(60) trading_licence_no: string;
  @IsUrl() licence_doc_url: string;
  @IsOptional() @IsDateString() licence_expires_at?: string;
}

/**
 * The statuses a reviewer can move a licence TO.
 *
 * `none` and `pending` are missing on purpose: those are written by the shop's
 * own actions (never submitted / just submitted), and letting an operator set
 * them by hand would let a review be undone into a state that reads as though
 * no review ever happened. A licence that should not have been verified is
 * `rejected`.
 *
 * Kept in step with the licence_status enum in apps/api/prisma/schema.prisma.
 */
export const REVIEWED_LICENCE_STATUSES = [
  'verified',
  'rejected',
  'expired',
] as const;

export type ReviewedLicenceStatus = (typeof REVIEWED_LICENCE_STATUSES)[number];

export class SetLicenceStatusDto {
  @IsIn(REVIEWED_LICENCE_STATUSES, {
    message: `licence_status must be one of: ${REVIEWED_LICENCE_STATUSES.join(', ')}`,
  })
  licence_status: ReviewedLicenceStatus;

  /**
   * Optional, and only written when present. A reviewer reading the document
   * usually has the expiry date in front of them and the owner may have got it
   * wrong on submission; omitting it leaves whatever was submitted.
   */
  @IsOptional()
  @IsDateString()
  licence_expires_at?: string;

  /**
   * Required exactly when `licence_status` is `rejected` — a rejection with no
   * reason leaves the owner staring at a red banner with nothing to act on
   * (see docs/API_CONTRACT.md § 8/§ 9.3). Ignored, and cleared in the service,
   * for every other status: a reason from a superseded rejection must not
   * outlive the decision that replaced it.
   */
  @ValidateIf((o: SetLicenceStatusDto) => o.licence_status === 'rejected')
  @IsString()
  @MaxLength(500)
  rejection_reason?: string;
}

export { GeoQuery };
