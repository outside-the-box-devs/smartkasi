import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import type { AuthUser } from '../../common/types/auth.types';
import { ShopAccessService } from '../shops/shop-access.service';
import { ShopsService } from '../shops/shops.service';
import { presentInventory } from '../inventory/inventory.service';
import { presentProduct } from '../catalog/catalog.service';

/**
 * Delta pull for the offline POS.
 *
 * The cursor is OUR server_time, echoed back by the client — never the device
 * clock. A till with a wrong clock would silently miss updates forever, and
 * that failure is invisible until stock-take.
 */
@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ShopAccessService,
    private readonly shops: ShopsService,
  ) {}

  async pull(user: AuthUser, shopId: string, since?: string) {
    await this.access.require(user, shopId);

    // Captured BEFORE the reads. If a write lands mid-request the client picks
    // it up on the next pull rather than never.
    const serverTime = new Date().toISOString();
    const cursor = since ? new Date(since) : undefined;

    const inventory = await this.prisma.shopProduct.findMany({
      where: { shopId, ...(cursor ? { updatedAt: { gt: cursor } } : {}) },
      include: { product: true },
      orderBy: { updatedAt: 'asc' },
    });

    const products = await this.prisma.product.findMany({
      where: {
        shopProducts: { some: { shopId } },
        ...(cursor ? { updatedAt: { gt: cursor } } : {}),
      },
      include: { category: true },
    });

    return {
      server_time: serverTime,
      is_full_snapshot: !since,
      shop: await this.shops.get(shopId),
      products: products.map(presentProduct),
      inventory: inventory.map(presentInventory),
      // Tombstones so a till that was offline drops items the owner removed.
      // Always empty until shop_products gets a deleted_at column — see the
      // known-limitations table in the README.
      deleted_shop_product_ids: [] as string[],
    };
  }
}
