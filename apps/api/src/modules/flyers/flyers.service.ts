import { Injectable } from '@nestjs/common';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../../prisma.service';
import { ApiError } from '../../common/errors/api-error';
import type { AuthUser } from '../../common/types/auth.types';
import { ShopAccessService } from '../shops/shop-access.service';
import type { Flyer } from '../../generated/prisma/client';

export class ListFlyersQuery {
  @IsOptional() @Type(() => Boolean) @IsBoolean() active_only = true;
}

export class CreateFlyerDto {
  @IsString() @MaxLength(120) title: string;
  @IsUrl() image_url: string;
  @IsDateString() starts_at: string;
  @IsDateString() ends_at: string;
}

/**
 * Flyers are the entire product for an `advertising_only` shop: no POS, no
 * inventory, just a photo of this week's specials. It is the cheapest possible
 * reason for a spaza owner to sign up, which is why it ships in v1.
 */
@Injectable()
export class FlyersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ShopAccessService,
  ) {}

  async list(shopId: string, q: ListFlyersQuery) {
    const today = new Date(new Date().toISOString().slice(0, 10));
    const rows = await this.prisma.flyer.findMany({
      where: {
        shopId,
        ...(q.active_only
          ? { isActive: true, startsAt: { lte: today }, endsAt: { gte: today } }
          : {}),
      },
      orderBy: { startsAt: 'desc' },
    });
    return { data: rows.map((r) => this.present(r)) };
  }

  async create(user: AuthUser, shopId: string, dto: CreateFlyerDto) {
    await this.access.require(user, shopId);
    const row = await this.prisma.flyer.create({
      data: {
        shopId,
        title: dto.title,
        imageUrl: dto.image_url,
        startsAt: new Date(dto.starts_at),
        endsAt: new Date(dto.ends_at),
      },
    });
    return this.present(row);
  }

  async remove(user: AuthUser, shopId: string, flyerId: string) {
    await this.access.require(user, shopId);
    const deleted = await this.prisma.flyer.deleteMany({
      where: { id: flyerId, shopId },
    });
    if (deleted.count === 0) throw ApiError.notFound('Flyer');
  }

  private present(r: Flyer) {
    return {
      id: r.id,
      shop_id: r.shopId,
      title: r.title,
      image_url: r.imageUrl,
      starts_at: r.startsAt.toISOString().slice(0, 10),
      ends_at: r.endsAt.toISOString().slice(0, 10),
      is_active: r.isActive,
      created_at: r.createdAt.toISOString(),
    };
  }
}
