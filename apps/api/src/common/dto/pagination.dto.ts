import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  per_page = 25;

  get offset(): number {
    return (this.page - 1) * this.per_page;
  }
}

export interface PageMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export function paginate<T>(
  data: T[],
  total: number,
  q: PaginationQuery,
): Paginated<T> {
  return {
    data,
    meta: {
      page: q.page,
      per_page: q.per_page,
      total,
      total_pages: Math.max(1, Math.ceil(total / q.per_page)),
    },
  };
}
