import { Type } from 'class-transformer';
import { IsInt, IsLatitude, IsLongitude, IsOptional, Max, Min } from 'class-validator';

export class GeoQuery {
  @IsOptional() @Type(() => Number) @IsLatitude()
  lat?: number;

  @IsOptional() @Type(() => Number) @IsLongitude()
  lng?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(100) @Max(10_000)
  radius_m = 2000;

  get hasPoint(): boolean {
    return this.lat !== undefined && this.lng !== undefined;
  }
}
