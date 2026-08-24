import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  home_address?: string;

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  home_lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  home_lng?: number;
}
