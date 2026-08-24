import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import type { AuthUser } from '../../common/types/auth.types';
import { UpdateMeDto } from './dto';
import type { Profile } from '../../generated/prisma/client';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Doubles as "complete registration". Supabase may have created the auth user
   * before the profile trigger existed, so upsert rather than 404 — a user who
   * can present a valid token should never be told they do not exist.
   *
   * Deliberately does NOT set role. profiles.role is the source of truth that
   * public.custom_access_token_hook reads to build the claim; seeding it FROM
   * the claim made the two seed each other, so the guard's 'customer' fallback
   * quietly became persisted data. Let the column default apply instead, and
   * change a role through PATCH /admin/users/:id/role.
   */
  async getOrCreate(user: AuthUser) {
    const profile = await this.prisma.profile.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        fullName: user.email?.split('@')[0] ?? 'SmartKasi user',
      },
    });
    return this.present(profile, await this.shopIds(user.id));
  }

  async update(user: AuthUser, dto: UpdateMeDto) {
    const profile = await this.prisma.profile.update({
      where: { id: user.id },
      data: {
        fullName: dto.full_name,
        phone: dto.phone,
        avatarUrl: dto.avatar_url,
        homeAddress: dto.home_address,
        homeLat: dto.home_lat,
        homeLng: dto.home_lng,
      },
    });
    return this.present(profile, await this.shopIds(user.id));
  }

  private async shopIds(userId: string): Promise<string[]> {
    const [owned, staffed] = await Promise.all([
      this.prisma.shop.findMany({
        where: { ownerId: userId },
        select: { id: true },
      }),
      this.prisma.shopStaff.findMany({
        where: { userId },
        select: { shopId: true },
      }),
    ]);
    return [
      ...new Set([...owned.map((s) => s.id), ...staffed.map((s) => s.shopId)]),
    ];
  }

  private present(p: Profile, shopIds: string[]) {
    return {
      id: p.id,
      role: p.role,
      full_name: p.fullName,
      phone: p.phone,
      avatar_url: p.avatarUrl,
      home_address: p.homeAddress,
      home_lat: p.homeLat,
      home_lng: p.homeLng,
      shop_ids: shopIds,
      created_at: p.createdAt.toISOString(),
    };
  }
}
