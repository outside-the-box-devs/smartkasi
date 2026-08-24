import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError } from '../../common/errors/api-error';
import type { UserRole } from '../../common/types/auth.types';
import type { Profile } from '../../generated/prisma/client';
import { SetRoleDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The only way to change a role. profiles.role is what
   * public.custom_access_token_hook reads when GoTrue mints a token, so this
   * write is what actually moves someone between apps.
   *
   * It takes effect on the user's NEXT token, not their current one — an access
   * token already on a phone keeps the old role until it expires or refreshes
   * (jwt_expiry 3600s). Demoting someone is therefore not instant, which is
   * worth knowing before treating this as a revocation mechanism.
   */
  async setRole(userId: string, dto: SetRoleDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { id: userId },
    });
    if (!existing) throw ApiError.notFound('User');

    const profile = await this.prisma.profile.update({
      where: { id: userId },
      data: { role: dto.role },
    });

    return this.present(profile, existing.role);
  }

  private present(p: Profile, previousRole: UserRole) {
    return {
      id: p.id,
      role: p.role,
      previous_role: previousRole,
      full_name: p.fullName,
      phone: p.phone,
      // Says out loud what the caller almost certainly wants to know next.
      takes_effect: 'on the next token this user is issued',
      updated_at: p.updatedAt.toISOString(),
    };
  }
}
