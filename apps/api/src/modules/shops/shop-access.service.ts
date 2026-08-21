import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ApiError } from '../../common/errors/api-error';
import type { AuthUser } from '../../common/types/auth.types';

export interface ShopPermissions {
  isOwner: boolean;
  canManageInventory: boolean;
  canVoidSales: boolean;
}

/**
 * Single place that answers "may this user act on this shop?".
 *
 * Every shop-scoped endpoint calls this. Do not re-derive permissions inline in
 * a controller — the moment two places disagree you have a security bug that
 * only shows up under one specific role.
 */
@Injectable()
export class ShopAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async require(user: AuthUser, shopId: string): Promise<ShopPermissions> {
    if (user.role === 'admin') {
      return { isOwner: true, canManageInventory: true, canVoidSales: true };
    }

    const owned = await this.prisma.shop.findFirst({
      where: { id: shopId, ownerId: user.id },
      select: { id: true },
    });
    if (owned) return { isOwner: true, canManageInventory: true, canVoidSales: true };

    const staff = await this.prisma.shopStaff.findUnique({
      where: { shopId_userId: { shopId, userId: user.id } },
      select: { canManageInventory: true, canVoidSales: true },
    });
    if (!staff) throw ApiError.forbidden('You do not work at this shop');

    return {
      isOwner: false,
      canManageInventory: staff.canManageInventory,
      canVoidSales: staff.canVoidSales,
    };
  }

  async requireInventoryRights(user: AuthUser, shopId: string): Promise<void> {
    const perms = await this.require(user, shopId);
    if (!perms.canManageInventory) {
      throw ApiError.forbidden("You are not allowed to change this shop's inventory");
    }
  }
}
