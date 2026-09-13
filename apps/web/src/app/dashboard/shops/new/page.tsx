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
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { Divider } from '@astryxdesign/core/Divider';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Icon } from '@astryxdesign/core/Icon';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { Switch } from '@astryxdesign/core/Switch';
import LocationPicker from '@/components/LocationPicker';
import type { PickedLocation } from '@/components/LocationPicker';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useCreateShop, useUpdateShop, useDeleteShop } from '@/hooks/use-shops';
import type { ShopMode } from '@/lib/api/shops';
import { catalogApi } from '@/lib/api/catalog';
import { inventoryApi, rands } from '@/lib/api/inventory';
import { useFeedback } from '@/hooks/use-feedback';

/** A price like "85" or "85.00" — no letters, no negative, no more than 2dp. */
const PRICE_RE = /^\d+(\.\d{1,2})?$/;

function priceError(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (!PRICE_RE.test(v) || parseFloat(v) <= 0) {
    return 'Enter a price greater than 0, like 85.00';
  }
  return null;
}

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
  mode: ShopMode;
  isActive: boolean;
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
  // Matches the API's own defaults — visible immediately, but with no live
  // stock or ordering until the owner opts into more.
  mode: 'advertising_only',
  isActive: true,
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
  const updateShop = useUpdateShop();
  const deleteShop = useDeleteShop();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [createdShopId, setCreatedShopId] = useState<string | null>(null);
  const isSaving = createShop.isPending || updateShop.isPending;

  function update(patch: Partial<Draft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setError(null);
  }

  // Step 2's primary action does double duty: the first time through it
  // creates the shop; if the owner came Back from step 3 to fix something,
  // the shop already exists so this patches it instead of creating a
  // duplicate.
  async function createOrSaveShop() {
    if (!draft.name.trim() || !draft.address_line.trim()) {
      setError('A shop name and street address are required.');
      return;
    }
    setError(null);
    const payload = {
      name: draft.name.trim(),
      address_line: draft.address_line.trim(),
      township: draft.township.trim() || undefined,
      city: draft.city.trim() || undefined,
      province: draft.province.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      description: draft.description.trim() || undefined,
      lat: draft.lat,
      lng: draft.lng,
      mode: draft.mode,
      is_active: draft.isActive,
    };
    try {
      if (createdShopId) {
        await updateShop.mutateAsync({ id: createdShopId, patch: payload });
      } else {
        const shop = await createShop.mutateAsync(payload);
        setCreatedShopId(shop.id);
      }
      setStep(3);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not save the shop — try again.',
      );
    }
  }

  function goBack() {
    setError(null);
    setStep((s) => s - 1);
  }

  // Cancel is only reachable at step 1, but a shop may already exist by then
  // (create-then-Back-then-Cancel) — the wizard is one unit of work, so
  // cancelling it must undo the create instead of leaving an empty orphan
  // shop behind. Deletion failing (already has stock, say) surfaces the
  // error and keeps the wizard open rather than silently discarding it.
  async function cancelWizard() {
    if (!createdShopId) {
      router.push('/dashboard/shops');
      return;
    }
    setError(null);
    try {
      await deleteShop.mutateAsync(createdShopId);
      router.push('/dashboard/shops');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Could not discard this shop — try again.',
      );
    }
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
            isCreating={isSaving}
            isEditing={!!createdShopId}
          />
        </Card>
      )}
      {step === 3 && createdShopId && (
        <FirstStockStep
          shopId={createdShopId}
          shopName={draft.name.trim()}
          onBack={() => setStep(2)}
        />
      )}

      {step < 3 && (
        <HStack gap={2} style={{ flexWrap: 'wrap' }}>
          <Button
            variant="ghost"
            label={step === 1 ? (deleteShop.isPending ? 'Discarding…' : 'Cancel') : 'Back'}
            onClick={step === 1 ? cancelWizard : goBack}
            isLoading={step === 1 && deleteShop.isPending}
            isDisabled={(isSaving && step === 2) || (step === 1 && deleteShop.isPending)}
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
              label={
                isSaving
                  ? (createdShopId ? 'Saving changes…' : 'Creating your shop…')
                  : (createdShopId ? 'Save changes' : 'Create shop')
              }
              onClick={createOrSaveShop}
              isLoading={isSaving}
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
      <HStack gap={2} style={{ alignItems: 'flex-start' }}>
        <Icon icon="info" color="accent" size="sm" />
        <Text type="supporting" color="secondary">
          Coming soon: AI will be able to turn a few words into a polished
          description for you.
        </Text>
      </HStack>
      <TextInput
        label="Phone"
        value={draft.phone}
        onChange={(v) => onChange({ phone: v })}
        placeholder="+27…"
        htmlName="phone"
      />
      <Divider />
      <RadioList
        label="Shop type"
        description="Change this any time — it doesn't affect the address or stock you set up."
        value={draft.mode}
        onChange={(v) => onChange({ mode: v as ShopMode })}
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
        description="Off keeps this shop private while you finish setting it up."
        value={draft.isActive}
        onChange={(checked) => onChange({ isActive: checked })}
        labelSpacing="spread"
      />
    </VStack>
  );
}

function LocationStep({
  draft,
  onChange,
  isCreating,
  isEditing,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  isCreating: boolean;
  isEditing: boolean;
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
          {isEditing ? 'Saving your changes — hang on a moment…' : 'Creating your shop — hang on a moment…'}
        </Text>
      )}
    </VStack>
  );
}

interface AddedItem {
  id: string;
  barcode: string;
  name: string;
  priceCents: number;
  qty: number;
}

function FirstStockStep({
  shopId,
  shopName,
  onBack,
}: {
  shopId: string;
  shopName: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const feedback = useFeedback();
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState<number | null>(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<AddedItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const priceMsg = priceError(price);

  function done() {
    router.push(`/dashboard/shops/${shopId}`);
  }

  async function addItem() {
    if (!barcode.trim() || !price.trim() || priceMsg) return;
    setAdding(true);
    try {
      // Same flow as the Stock panel: resolve (or create) the product, then
      // put it on this shop's list at the selling price and quantity. `name`
      // only takes effect when the barcode is genuinely new — an existing
      // product keeps its catalog name regardless of what's typed here.
      const product = await catalogApi.resolveBarcode(barcode.trim(), name.trim());
      const cents = Math.round(parseFloat(price) * 100);
      const stockQty = qty ?? 0;
      const item = await inventoryApi.add(shopId, product.id, cents, stockQty);
      setAdded((items) => [
        { id: item.id, barcode: barcode.trim(), name: product.name, priceCents: cents, qty: stockQty },
        ...items,
      ]);
      feedback.success(`${product.name} added to stock`, barcode.trim());
      setBarcode('');
      setName('');
      setPrice('');
      setQty(1);
    } catch {
      feedback.error("Couldn't add that item — check the barcode and price.", 'add-item');
    }
    setAdding(false);
  }

  // Soft-removes a line added by mistake — the inventory row stays (an
  // audit/undo trail) but is marked unavailable so it doesn't show as stock.
  async function removeItem(item: AddedItem) {
    setRemovingId(item.id);
    try {
      await inventoryApi.update(shopId, item.id, { is_available: false });
      setAdded((items) => items.filter((it) => it.id !== item.id));
      feedback.success(`${item.name} removed`, item.id);
    } catch {
      feedback.error("Couldn't remove that item — try again.", 'remove-item');
    }
    setRemovingId(null);
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
                label="Item name"
                description="Only used the first time this barcode is stocked anywhere"
                value={name}
                onChange={setName}
                placeholder="e.g. White bread 700g"
                htmlName="item-name"
              />
              <TextInput
                label="Selling price (R)"
                value={price}
                onChange={setPrice}
                placeholder="85.00"
                htmlName="price"
                status={priceMsg ? { type: 'error', message: priceMsg } : undefined}
              />
              <NumberInput
                label="Quantity"
                value={qty}
                onChange={setQty}
                min={0}
                isIntegerOnly
                hasNumberSteppers
                width={110}
                htmlName="quantity"
              />
              <Button
                label="Add item"
                variant="primary"
                type="submit"
                isDisabled={!barcode.trim() || !price.trim() || !!priceMsg}
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
              <HStack key={it.id} gap={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="body">{it.name}</Text>
                <HStack gap={3} style={{ alignItems: 'center' }}>
                  <Text type="supporting">{it.qty} in stock</Text>
                  <Text style={{ fontWeight: 600 }}>{rands(it.priceCents)}</Text>
                  <Button
                    variant="destructive"
                    size="sm"
                    label="Remove"
                    onClick={() => removeItem(it)}
                    isLoading={removingId === it.id}
                    isDisabled={removingId !== null}
                  />
                </HStack>
              </HStack>
            ))}
          </VStack>
        </Card>
      )}

      <HStack gap={2} style={{ flexWrap: 'wrap' }}>
        <Button variant="ghost" label="Back" onClick={onBack} isDisabled={adding} />
        <Button variant="ghost" label="Skip for now" onClick={done} isDisabled={adding} />
        <Button
          variant="primary"
          label={adding ? 'Saving…' : `Done — view ${shopName ? `“${shopName}”` : 'my shop'}`}
          onClick={done}
          isLoading={adding}
        />
      </HStack>
    </VStack>
  );
}
