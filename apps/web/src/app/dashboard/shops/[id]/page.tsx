'use client';

import { Suspense, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Banner } from '@astryxdesign/core/Banner';
import { TabList, Tab } from '@astryxdesign/core/TabList';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { Switch } from '@astryxdesign/core/Switch';
import { useAuth } from '@/lib/auth/auth-context';
import { useShop, useUpdateShop } from '@/hooks/use-shops';
import { friendlyLicence, licenceDotVariant } from '@/lib/api/shops';
import type { ShopDetail, ShopMode } from '@/lib/api/shops';

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
  // Tabs live in the URL (?tab=stock) alone — no local override — so a deep
  // link or any other in-app navigation to a new ?tab= is never shadowed by
  // stale component state.
  const tabParam = searchParams.get('tab') ?? '';
  const tab = (TABS.some(([key]) => key === tabParam) ? tabParam : 'overview') as TabKey;
  const { user } = useAuth();
  const { data: shop, isLoading, isError } = useShop(shopId);

  function switchTab(key: string) {
    router.replace(`/dashboard/shops/${shopId}?tab=${key}`, { scroll: false });
  }

  if (isLoading) return <Spinner size="md" />;
  if (isError) {
    return (
      <VStack gap={2}>
        <Banner
          status="error"
          title="Can't load this shop right now"
          description="Check your connection and refresh the page."
        />
        <Button variant="secondary" label="← Back to shops" onClick={() => router.push('/dashboard/shops')} />
      </VStack>
    );
  }
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
          <HStack gap={2} style={{ alignItems: 'center' }}>
            <StatusDot
              variant={licenceDotVariant(shop.licence_status)}
              label={friendlyLicence(shop.licence_status)}
            />
            <Text type="supporting">{friendlyLicence(shop.licence_status)}</Text>
          </HStack>
          <HStack gap={2} style={{ alignItems: 'center' }}>
            <StatusDot
              variant={shop.accepts_orders ? 'success' : 'neutral'}
              label={shop.accepts_orders ? 'Taking orders' : 'Not taking orders'}
            />
            <Text type="supporting">{shop.accepts_orders ? 'Taking orders' : 'Not taking orders'}</Text>
          </HStack>
        </HStack>
        {(shop.address_line || shop.township) && (
          <Text type="body" color="secondary">
            {[shop.address_line, shop.township, shop.city].filter(Boolean).join(', ')}
          </Text>
        )}
        {user && <Text type="supporting">Signed in as {user.email}</Text>}
      </VStack>

      <HStack gap={3} style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <TabList value={tab} onChange={switchTab} hasDivider>
          {TABS.map(([key, label]) => (
            <Tab key={key} value={key} label={label} />
          ))}
        </TabList>
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
  const [editing, setEditing] = useState(false);

  if (editing) {
    return <EditShopTypeForm shop={shop} onDone={() => setEditing(false)} />;
  }

  return (
    <Card>
      <VStack gap={3}>
        {shop.description && <Text type="body">{shop.description}</Text>}
        <HStack gap={6} style={{ flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <HStack gap={6} style={{ flexWrap: 'wrap' }}>
            <Fact label="Shop type" value={friendlyMode(shop.mode)} />
            <Fact label="Orders" value={shop.accepts_orders ? 'Open to customers' : 'Closed'} />
            <Fact label="Visibility" value={shop.is_active === false ? 'Hidden from customers' : 'Visible to customers'} />
          </HStack>
          <Button variant="ghost" size="sm" label="Edit" onClick={() => setEditing(true)} />
        </HStack>
      </VStack>
    </Card>
  );
}

function EditShopTypeForm({ shop, onDone }: { shop: ShopDetail; onDone: () => void }) {
  const updateShop = useUpdateShop();
  const [mode, setMode] = useState<ShopMode>(shop.mode);
  const [isActive, setIsActive] = useState(shop.is_active);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      await updateShop.mutateAsync({ id: shop.id, patch: { mode, is_active: isActive } });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save changes — try again.');
    }
  }

  return (
    <Card>
      <VStack gap={4}>
        {error && (
          <Banner status="warning" title={error} isDismissable onDismiss={() => setError(null)} />
        )}
        <RadioList
          label="Shop type"
          description="Change this any time — it doesn't affect your stock or licence."
          value={mode}
          onChange={(v) => setMode(v as ShopMode)}
        >
          <RadioListItem
            label="Advertising only"
            value="advertising_only"
            description="Show up on the map with your details. No prices or stock shown yet."
          />
          <RadioListItem
            label="Stock only"
            value="inventory_only"
            description="List your products and prices so customers can compare, but they still buy in person."
          />
          <RadioListItem
            label="Full store"
            value="full"
            description="Customers can browse your stock and order for delivery or collection, once your trading licence is verified."
          />
        </RadioList>
        <Switch
          label="Visible to customers"
          description="Off keeps this shop private."
          value={isActive}
          onChange={setIsActive}
          labelSpacing="spread"
        />
        <HStack gap={2} style={{ flexWrap: 'wrap' }}>
          <Button variant="ghost" label="Cancel" onClick={onDone} isDisabled={updateShop.isPending} />
          <Button
            variant="primary"
            label={updateShop.isPending ? 'Saving…' : 'Save changes'}
            onClick={save}
            isLoading={updateShop.isPending}
          />
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
