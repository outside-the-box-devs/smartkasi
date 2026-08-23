'use client';

import { useQuery } from '@tanstack/react-query';
import { Banner } from '@astryxdesign/core/Banner';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { useShops, useLowStock } from '@/hooks/use-shops';

export default function LowStockAlert() {
  const { data: shops = [] } = useShops();
  const shopIds = shops.map((s) => s.id);
  const { data: low = [] } = useLowStock(shopIds);

  if (low.length === 0) return null;

  return (
    <Banner
      status="warning"
      title={`${low.length} item${low.length > 1 ? 's' : ''} running low`}
      description="Restock these soon — customers see them as low availability."
    >
      <VStack gap={2} style={{ marginTop: 'var(--spacing-3)' }}>
        {low.slice(0, 4).map((it) => (
          <HStack key={it.id} gap={2} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <VStack gap={1}>
              <Text style={{ fontWeight: 600 }}>{it.product.name}</Text>
              <Text type="supporting">
                {[it.product.brand, it.product.unit_size].filter(Boolean).join(' • ')}
              </Text>
            </VStack>
            <Badge variant="warning" label={`${it.stock_qty} left`} />
          </HStack>
        ))}
      </VStack>
    </Banner>
  );
}
