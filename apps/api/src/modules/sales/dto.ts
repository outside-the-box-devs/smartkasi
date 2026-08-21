import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsEnum, IsInt,
  IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export enum PaymentMethod {
  cash = 'cash',
  card = 'card',
  qr = 'qr',
  account = 'account',
}

export class SaleItemDto {
  @IsUUID() product_id: string;
  @Type(() => Number) @IsInt() @Min(1) qty: number;

  /**
   * The price actually charged at the till. Sent by the client because an
   * offline till may have been using last week's price — the receipt must match
   * what the customer paid, not what the catalog says now.
   */
  @Type(() => Number) @IsInt() @Min(0) unit_price_cents: number;
}

export class CreateSaleDto {
  /** Device-generated. THE idempotency key. Never regenerate on retry. */
  @IsUUID() client_sale_id: string;

  @IsDateString() sold_at: string;

  @IsOptional() @IsEnum(PaymentMethod) payment_method: PaymentMethod = PaymentMethod.cash;

  @Type(() => Number) @IsInt() @Min(0) subtotal_cents: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) discount_cents = 0;
  @Type(() => Number) @IsInt() @Min(0) total_cents: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) amount_tendered_cents?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) change_cents?: number;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => SaleItemDto)
  items: SaleItemDto[];
}

export class BatchSalesDto {
  @IsArray() @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => CreateSaleDto)
  sales: CreateSaleDto[];
}

export class ListSalesQuery extends PaginationQuery {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
  @IsOptional() @IsUUID() cashier_id?: string;
}

export class VoidSaleDto {
  @IsString() @MaxLength(240) reason: string;
}

export class DailyReportQuery {
  @IsOptional() @IsDateString() date?: string;
}
