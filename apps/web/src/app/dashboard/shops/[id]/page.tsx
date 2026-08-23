'use client';

import { Suspense, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Spinner } from '@astryxdesign/core/Spinner';
import { useAuth } from '@/lib/auth/auth-context';
import { useShop } from '@/hooks/use-shops';
import { friendlyLicence } from '@/lib/api/shops';
import type { ShopDetail } from '@/lib/api/shops';

const TABS = [
  ['overview', 'Overview'],
  ['license', 'Licence'],
  ['inventory', 'Stock'],
  ['pos', 'Sell'],
  ['flyers', 'Flyers'],
] as const;

type TabKey = (typeof TABS)[number][0];

// Tab panels are heavy (camera, tables) — load each on demand.
import dynamic from 'next/dynamic';
const LicensePanel = dynamic(() => import('@/components/LicensePanel'), { ssr: false, loading: () => <PanelSpinner /> });
const InventoryPanel = dynamic(() => import('@/components/InventoryPanel'), { ssr: false, loading: () => <PanelSpinner /> });
const POSPanel = dynamic(() => import('@/components/POSPanel'), { ssr: false, loading: () => <PanelSpinner /> });
const FlyersPanel = dynamic(() => import('@/components/FlyersPanel'), { ssr: false, loading: () => <PanelSpinner /> });

/** Suspense boundary: useSearchParams must not run during static prerender. */
export default function ShopDetailPage() {
  return (
    <Suspense fallback={<PanelSpinner />}>
      <ShopDetailInner />
    </Suspense>
  );
}

function ShopDetailInner() {
  const params = useParams() as { id: string };
  const shopId = params.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  // Tabs live in the URL (?tab=stock) so refresh, back and deep links work.
  const tabParam = searchParams.get('tab') ?? '';
  const initialTab = (TABS.some(([key]) => key === tabParam) ? tabParam : 'overview') as TabKey;
  const [tabOverride, setTabOverride] = useState<TabKey | null>(null);
  const tab = tabOverride ?? initialTab;
  const { user } = useAuth();
  const { data: shop, isLoading } = useShop(shopId);

  function switchTab(key: TabKey) {
    setTabOverride(key);
    router.replace(`/dashboard/shops/${shopId}?tab=${key}`, { scroll: false });
  }

  if (isLoading) return <Spinner size="md" />;
  if (!shop) {
    return (
      <VStack gap={2}>
        <Heading level={3}>Shop not found</Heading>
        <Button variant="secondary" label="← Back to shops" onClick={() => router.push('/dashboard/shops')} />
      </VStack>
    );
  }

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <HStack gap={3} style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Heading level={2}>{shop.name}</Heading>
          <Badge
            variant={shop.licence_status === 'verified' ? 'success' : shop.licence_status === 'pending' ? 'warning' : 'neutral'}
            label={friendlyLicence(shop.licence_status)}
          />
          <Badge variant={shop.accepts_orders ? 'teal' : 'neutral'} label={shop.accepts_orders ? 'Taking orders' : 'Not taking orders'} />
        </HStack>
        {(shop.address_line || shop.township) && (
          <Text type="body" color="secondary">
            {[shop.address_line, shop.township, shop.city].filter(Boolean).join(', ')}
          </Text>
        )}
        {user && <Text type="supporting">Signed in as {user.email}</Text>}
      </VStack>

      <HStack gap={2} style={{ flexWrap: 'wrap' }}>
        {TABS.map(([key, label]) => (
          <Button key={key} size="sm" variant={tab === key ? 'primary' : 'secondary'} label={label} onClick={() => switchTab(key)} />
        ))}
        <Button size="sm" variant="ghost" label="← All shops" onClick={() => router.push('/dashboard/shops')} />
      </HStack>

      {tab === 'overview' && <OverviewCard shop={shop} />}
      {tab === 'license' && <LicensePanel shop={shop} />}
      {tab === 'inventory' && <InventoryPanel shopId={shopId} />}
      {tab === 'pos' && <POSPanel shopId={shopId} />}
      {tab === 'flyers' && <FlyersPanel shopId={shopId} mode={shop.mode} />}
    </VStack>
  );
}

function OverviewCard({ shop }: { shop: ShopDetail }) {
  return (
    <Card>
      <VStack gap={3}>
        {shop.description && <Text type="body">{shop.description}</Text>}
        <HStack gap={6} style={{ flexWrap: 'wrap' }}>
          <Fact label="Shop type" value={friendlyMode(shop.mode)} />
          <Fact label="Orders" value={shop.accepts_orders ? 'Open to customers' : 'Closed'} />
          <Fact label="Visibility" value={shop.is_active === false ? 'Hidden from customers' : 'Visible to customers'} />
        </HStack>
      </VStack>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap={1}>
      <Text type="supporting">{label}</Text>
      <Text>{value}</Text>
    </VStack>
  );
}

function friendlyMode(mode: string): string {
  switch (mode) {
    case 'advertising_only': return 'Advertising only';
    case 'inventory_only': return 'Stock only';
    default: return 'Full store';
  }
}

function PanelSpinner() {
  return <Spinner size="md" />;
}
