'use client';

// Add-a-shop wizard — replaces the old cramped modal with three short steps:
//   1. About your shop (name, what you sell, phone)
//   2. Where it is (address search / current location / map pin)
//   3. First stock (optional; skippable in one tap)
// The shop is created at the end of step 2 so step 3 uses the real shop id.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Divider } from '@astryxdesign/core/Divider';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import LocationPicker from '@/components/LocationPicker';
import type { PickedLocation } from '@/components/LocationPicker';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useCreateShop } from '@/hooks/use-shops';
import { catalogApi } from '@/lib/api/catalog';
import { inventoryApi, rands } from '@/lib/api/inventory';
import { useFeedback } from '@/hooks/use-feedback';

const TOTAL_STEPS = 3;

const STEP_TITLES: Record<number, string> = {
  1: 'About your shop',
  2: 'Where customers will find you',
  3: 'Stock your shelves (optional)',
};

interface Draft {
  name: string;
  description: string;
  phone: string;
  address_line: string;
  township: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
}

const INITIAL_DRAFT: Draft = {
  name: '',
  description: '',
  phone: '',
  address_line: '',
  township: '',
  city: '',
  province: '',
  // Soweto centre until the owner picks a spot.
  lat: -26.2461,
  lng: 27.9212,
};

function applyLocation(draft: Draft, loc: Partial<PickedLocation>): Draft {
  return {
    ...draft,
    lat: loc.lat ?? draft.lat,
    lng: loc.lng ?? draft.lng,
    // Only overwrite text when the geocoder knows it — dragging the pin or
    // tapping the map must never wipe what was typed.
    address_line: loc.address_line ?? draft.address_line,
    township: loc.township ?? draft.township,
    city: loc.city ?? draft.city,
    province: loc.province ?? draft.province,
  };
}

export default function NewShopPage() {
  const router = useRouter();
  const createShop = useCreateShop();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [createdShopId, setCreatedShopId] = useState<string | null>(null);

  function update(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  }

  async function createTheShop() {
    if (!draft.name.trim() || !draft.address_line.trim()) {
      setError('A shop name and street address are required.');
      return;
    }
    setError(null);
    try {
      const shop = await createShop.mutateAsync({
        name: draft.name.trim(),
        address_line: draft.address_line.trim(),
        township: draft.township.trim() || undefined,
        city: draft.city.trim() || undefined,
        province: draft.province.trim() || undefined,
        phone: draft.phone.trim() || undefined,
        description: draft.description.trim() || undefined,
        lat: draft.lat,
        lng: draft.lng,
      });
      setCreatedShopId(shop.id);
      setStep(3);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not create the shop — try again.',
      );
    }
  }

  function goBack() {
    setError(null);
    if (step === 1) router.push('/dashboard/shops');
    else setStep(step - 1);
  }

  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <HStack gap={3} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Heading level={2}>Add a shop</Heading>
          <Badge variant="neutral" label={`Step ${step} of ${TOTAL_STEPS}`} />
        </HStack>
        <Text type="body" color="secondary">{STEP_TITLES[step]}</Text>
        <ProgressBar
          label={`Step ${step} of ${TOTAL_STEPS}`}
          value={step}
          max={TOTAL_STEPS}
          isLabelHidden
        />
      </VStack>

      {error && (
        <Banner
          status="warning"
          title={error}
          isDismissable
          onDismiss={() => setError(null)}
        />
      )}

      {step === 1 && (
        <Card>
          <AboutStep draft={draft} onChange={update} />
        </Card>
      )}
      {step === 2 && (
        <Card>
          <LocationStep
            draft={draft}
            onChange={(patch) => update(patch)}
            isCreating={createShop.isPending}
          />
        </Card>
      )}
      {step === 3 && createdShopId && (
        <FirstStockStep shopId={createdShopId} shopName={draft.name.trim()} />
      )}

      {step < 3 && (
        <HStack gap={2} style={{ flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            label={step === 1 ? 'Cancel' : 'Back'}
            onClick={goBack}
            isDisabled={createShop.isPending && step === 2}
          />
          {step === 1 ? (
            <Button
              variant="primary"
              label="Continue"
              onClick={() => setStep(2)}
              isDisabled={!draft.name.trim()}
            />
          ) : (
            <Button
              variant="primary"
              label={createShop.isPending ? 'Creating your shop…' : 'Create shop'}
              onClick={createTheShop}
              isLoading={createShop.isPending}
              isDisabled={!draft.name.trim() || !draft.address_line.trim()}
            />
          )}
        </HStack>
      )}
    </VStack>
  );
}

function AboutStep({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
}) {
  return (
    <VStack gap={4}>
      <Text type="body" color="secondary">
        Just the basics for now — you can change all of this later.
      </Text>
      <TextInput
        label="Shop name"
        value={draft.name}
        onChange={(v) => onChange({ name: v })}
        placeholder="e.g. Mama Thoko's Tuckshop"
        isRequired
        htmlName="name"
      />
      <TextArea
        label="What do you sell?"
        description="One or two lines customers will recognise."
        value={draft.description}
        onChange={(v) => onChange({ description: v })}
        placeholder="Groceries, cold drinks, school snacks"
        rows={3}
        maxLength={280}
      />
      <TextInput
        label="Phone"
        value={draft.phone}
        onChange={(v) => onChange({ phone: v })}
        placeholder="+27…"
        htmlName="phone"
      />
    </VStack>
  );
}

function LocationStep({
  draft,
  onChange,
  isCreating,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  isCreating: boolean;
}) {
  return (
    <VStack gap={4}>
      <Text type="body" color="secondary">
        No coordinates needed — search the street name or use your current
        location and we&apos;ll do the map part.
      </Text>
      <LocationPicker
        lat={draft.lat}
        lng={draft.lng}
        onChange={(loc) => onChange(applyLocation(draft, loc))}
      />
      <Divider />
      <TextInput
        label="Street address"
        value={draft.address_line}
        onChange={(v) => onChange({ address_line: v })}
        placeholder="1423 Vilakazi St"
        isRequired
        description="Filled in automatically when you pick an address above"
        htmlName="address-line"
      />
      <HStack gap={3} style={{ flexWrap: 'wrap' }}>
        <TextInput
          label="Township"
          value={draft.township}
          onChange={(v) => onChange({ township: v })}
          placeholder="Orlando West"
        />
        <TextInput
          label="City"
          value={draft.city}
          onChange={(v) => onChange({ city: v })}
          placeholder="Soweto"
        />
        <TextInput
          label="Province"
          value={draft.province}
          onChange={(v) => onChange({ province: v })}
          placeholder="Gauteng"
        />
      </HStack>
      {isCreating && (
        <Text type="supporting" color="secondary">
          Creating your shop — hang on a moment…
        </Text>
      )}
    </VStack>
  );
}

interface AddedItem {
  barcode: string;
  name: string;
  priceCents: number;
}

function FirstStockStep({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const router = useRouter();
  const feedback = useFeedback();
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<AddedItem[]>([]);

  function done() {
    router.push(`/dashboard/shops/${shopId}`);
  }

  async function addItem() {
    if (!barcode.trim() || !price.trim()) return;
    setAdding(true);
    try {
      // Same flow as the Stock panel: resolve (or create) the product, then
      // put it on this shop's list at the selling price.
      const product = await catalogApi.resolveBarcode(barcode.trim());
      const cents = Math.round(parseFloat(price) * 100);
      await inventoryApi.add(shopId, product.id, cents);
      setAdded((items) => [
        { barcode: barcode.trim(), name: product.name, priceCents: cents },
        ...items,
      ]);
      feedback.success(`${product.name} added to stock`, barcode.trim());
      setBarcode('');
      setPrice('');
    } catch {
      feedback.error("Couldn't add that item — check the barcode and price.", 'add-item');
    }
    setAdding(false);
  }

  return (
    <VStack gap={4}>
      <Banner
        status="success"
        title={`${shopName || 'Your shop'} is live!`}
        description="Add a few items now if you like — otherwise your shelves can wait."
      />

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addItem();
          }}
        >
          <VStack gap={3}>
            <HStack gap={3} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <TextInput
                label="Barcode"
                value={barcode}
                onChange={setBarcode}
                placeholder="Scan or type the barcode"
                htmlName="barcode"
              />
              <TextInput
                label="Selling price (R)"
                value={price}
                onChange={setPrice}
                placeholder="85.00"
                htmlName="price"
              />
              <Button
                label="Add item"
                variant="primary"
                type="submit"
                isDisabled={!barcode.trim() || !price.trim()}
                isLoading={adding}
              />
            </HStack>
            <Collapsible trigger="Or scan with the camera" defaultIsOpen={false}>
              <BarcodeScanner shopId={shopId} onScan={(code) => setBarcode(code)} />
            </Collapsible>
          </VStack>
        </form>
      </Card>

      {added.length > 0 && (
        <Card>
          <VStack gap={3}>
            <Heading level={4}>
              Added today ({added.length} item{added.length === 1 ? '' : 's'})
            </Heading>
            {added.map((it) => (
              <HStack key={it.barcode + it.priceCents} gap={3} style={{ justifyContent: 'space-between' }}>
                <Text type="body">{it.name}</Text>
                <Text style={{ fontWeight: 600 }}>{rands(it.priceCents)}</Text>
              </HStack>
            ))}
          </VStack>
        </Card>
      )}

      <HStack gap={2} style={{ flexWrap: 'wrap' }}>
        <Button variant="ghost" label="Skip for now" onClick={done} isDisabled={adding} />
        <Button
          variant="primary"
          label={adding ? 'Saving…' : `Done — go to ${shopName || 'my shop'}`}
          onClick={done}
          isLoading={adding}
        />
      </HStack>
    </VStack>
  );
}
