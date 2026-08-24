import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class ListInventoryQuery extends PaginationQuery {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @Type(() => Boolean) @IsBoolean() low_stock?: boolean;
  @IsOptional() @IsDateString() updated_since?: string;
}

export class AddInventoryItemDto {
  @IsUUID() product_id: string;
  @Type(() => Number) @IsInt() @Min(0) price_cents: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) cost_cents?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock_qty = 0;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) low_stock_threshold = 5;
}

export class UpdateInventoryItemDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) price_cents?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) cost_cents?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock_qty?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  low_stock_threshold?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() is_available?: boolean;
  @IsOptional() @IsDateString() client_updated_at?: string;
}

export class BulkInventoryItemDto {
  @IsUUID() product_id: string;
  @Type(() => Number) @IsInt() @Min(0) price_cents: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) stock_qty?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  low_stock_threshold?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() is_available?: boolean;
  @IsDateString() client_updated_at: string;
}

export class BulkUpsertInventoryDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => BulkInventoryItemDto)
  items: BulkInventoryItemDto[];
}
