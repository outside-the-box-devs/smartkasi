import { IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class ListProductsQuery extends PaginationQuery {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsUUID() category_id?: string;
}

export class CreateProductDto {
  @IsOptional() @IsString() @MaxLength(32) barcode?: string;
  @IsString() @MaxLength(160) name: string;
  @IsOptional() @IsString() @MaxLength(80) brand?: string;
  @IsOptional() @IsString() @MaxLength(40) unit_size?: string;
  @IsOptional() @IsUUID() category_id?: string;
  @IsOptional() @IsUrl() image_url?: string;
  /** Required when barcode is omitted — a shop-local item must belong to a shop. */
  @IsOptional() @IsUUID() shop_id?: string;
}

export class BarcodeLookupQuery {
  @IsOptional() @IsUUID() shop_id?: string;
}
