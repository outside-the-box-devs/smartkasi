import { IsEnum, IsInt, IsOptional, IsUrl, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum CourierModeDto {
  foot = 'foot',
  bicycle = 'bicycle',
  vehicle = 'vehicle',
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
