'use client';

import { Banner } from '@astryxdesign/core/Banner';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { useShops, useLowStock } from '@/hooks/use-shops';

const VISIBLE = 4;

export default function LowStockAlert() {
  // Must be scoped to this owner's own shops — without owner_id:'me' this
  // queries the public directory (every active shop platform-wide), so the
  // alert could surface other owners' low-stock items alongside your own.
  const { data: shops = [] } = useShops({ owner_id: 'me' });
  const shopIds = shops.map((s) => s.id);
  const { data: low = [] } = useLowStock(shopIds);
  const shopName = new Map(shops.map((s) => [s.id, s.name]));
  const multiShop = shops.length > 1;

  if (low.length === 0) return null;

  return (
    <Banner
      status="warning"
      title={`${low.length} item${low.length > 1 ? 's' : ''} running low`}
      description="Restock these soon — customers see them as low availability."
    >
      <VStack gap={2} style={{ marginTop: 'var(--spacing-3)' }}>
        {low.slice(0, VISIBLE).map((it) => (
          <HStack key={it.id} gap={2} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack gap={1}>
              <Text style={{ fontWeight: 600 }}>{it.product.name}</Text>
              <Text type="supporting">
                {[
                  multiShop ? shopName.get(it.shopId) : null,
                  it.product.brand,
                  it.product.unit_size,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Text>
            </VStack>
            <Badge variant="warning" label={`${it.stock_qty} left`} />
          </HStack>
        ))}
        {low.length > VISIBLE && (
          <Text type="supporting">+{low.length - VISIBLE} more</Text>
        )}
      </VStack>
    </Banner>
  );
}
