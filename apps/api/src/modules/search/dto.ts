import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class SearchProductsQuery extends PaginationQuery {
  @IsString() @MinLength(2) q: string;

  @IsOptional() @Type(() => Number) @IsLatitude() lat?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() lng?: number;
  @IsOptional() @Type(() => Number) radius_m = 2000;

  @IsOptional() @IsIn(['price', 'distance']) sort: 'price' | 'distance' =
    'price';

  @IsOptional() @Type(() => Boolean) @IsBoolean() in_stock_only = true;
}
