import { Type } from 'class-transformer';
import {
  IsBoolean, IsDateString, IsEnum, IsLatitude, IsLongitude, IsOptional,
  IsString, IsUrl, MaxLength,
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
}

export class UpdateShopDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsUrl() logo_url?: string;
  @IsOptional() @IsString() address_line?: string;
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

export { GeoQuery };
