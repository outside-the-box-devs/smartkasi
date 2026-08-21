import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsEnum, IsLatitude, IsLongitude, IsOptional,
  IsString, IsUUID, MaxLength, Min, IsInt, ValidateNested,
} from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export enum FulfilmentType { delivery = 'delivery', collection = 'collection' }

export enum RejectReason {
  out_of_stock = 'out_of_stock',
  closed = 'closed',
  too_busy = 'too_busy',
  cannot_fulfil = 'cannot_fulfil',
  other = 'other',
}

export class OrderItemInputDto {
  @IsUUID() shop_id: string;
  @IsUUID() product_id: string;
  @Type(() => Number) @IsInt() @Min(1) qty: number;
}

export class QuoteRequestDto {
  @IsEnum(FulfilmentType) fulfilment_type: FulfilmentType;
  @IsOptional() @Type(() => Number) @IsLatitude() dropoff_lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() dropoff_lng?: number;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];
}

export class CreateOrderDto {
  @IsString() quote_id: string;
  @IsOptional() @IsString() @MaxLength(240) dropoff_address?: string;
  @IsOptional() @IsString() @MaxLength(240) dropoff_notes?: string;
  @IsOptional() @IsString() @MaxLength(20) customer_phone?: string;
}

export class CancelOrderDto {
  @IsString() @MaxLength(240) reason: string;
}

export class RejectLegDto {
  @IsEnum(RejectReason) reason: RejectReason;
  @IsOptional() @IsString() @MaxLength(240) note?: string;
}

export class FulfilledItemDto {
  @IsUUID() order_item_id: string;
  @Type(() => Number) @IsInt() @Min(0) fulfilled_qty: number;
}

export class AcceptLegDto {
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FulfilledItemDto)
  fulfilled?: FulfilledItemDto[];
}

export class ListOrdersQuery extends PaginationQuery {
  @IsOptional() @IsString() status?: string;
}
