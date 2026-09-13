'use client';

import { useState } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Button } from '@astryxdesign/core/Button';
import { Table, proportional, pixel } from '@astryxdesign/core/Table';
import { TextInput } from '@astryxdesign/core/TextInput';
import { NumberInput } from '@astryxdesign/core/NumberInput';
import { Banner } from '@astryxdesign/core/Banner';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { rands } from '@/lib/api/inventory';
import type { InventoryItem } from '@/lib/api/inventory';
import { catalogApi } from '@/lib/api/catalog';
import { useInventory, useAddToStock, useUpdateInventoryItem } from '@/hooks/use-shops';
import { useFeedback } from '@/hooks/use-feedback';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function InventoryPanel({ shopId }: { shopId: string }) {
  const feedback = useFeedback();
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState<number | null>(1);

  const { data: items = [], isLoading, isError } = useInventory(shopId);
  const addMutation = useAddToStock(shopId);
  const restockMutation = useUpdateInventoryItem(shopId);
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const lowStock = items.filter((it) => it.stock_qty <= it.low_stock_threshold);

  const handleAdd = async () => {
    try {
      // 1. Resolve the barcode to a product (creates a local item if unknown —
      //    `name` only takes effect then; an existing barcode keeps its name)
      const product = await catalogApi.resolveBarcode(barcode.trim(), name.trim());
      // 2. Put it on this shop's stock list at the selling price and quantity
      const item = await addMutation.mutateAsync({
        productId: product.id,
        priceCents: Math.round(parseFloat(price || '0') * 100),
        stockQty: qty ?? undefined,
      });
      feedback.success(`${product.name} added to stock`, item.id);
      setBarcode('');
      setName('');
      setPrice('');
      setQty(1);
    } catch (e) {
      feedback.error(
        (e as { status?: number })?.status === 401
          ? 'Sign in as the shop owner to change stock.'
          : "Couldn't add that item — check the barcode and price.",
        'add-item',
      );
    }
  };

  async function restock(item: InventoryItem, addQty: number) {
    setRestockingId(item.id);
    try {
      await restockMutation.mutateAsync({ itemId: item.id, patch: { stock_qty: item.stock_qty + addQty } });
      feedback.success(`${item.product.name} restocked (+${addQty})`, item.id);
    } catch {
      feedback.error("Couldn't update stock — try again.", 'restock-item');
    }
    setRestockingId(null);
  }

  const columns = [
    {
      key: 'product',
      header: 'Product',
      width: proportional(2),
      renderCell: (it: typeof items[number]) => (
        <VStack gap={1}>
          <Text style={{ fontWeight: 600 }}>{it.product.name}</Text>
          <Text type="supporting">
            {[it.product.brand, it.product.unit_size].filter(Boolean).join(' • ')}
          </Text>
        </VStack>
      ),
    },
    { key: 'price', header: 'Your price', width: pixel(120), renderCell: (it: any) => <Text>{rands(it.price_cents)}</Text> },
    { key: 'stock', header: 'In stock', width: pixel(110), renderCell: (it: any) => (
      <HStack gap={2} style={{ alignItems: 'center' }}>
        <Text>{it.stock_qty}</Text>
        {it.is_low_stock && (
          <HStack gap={1} style={{ alignItems: 'center' }}>
            <StatusDot variant="warning" label="Low stock" />
            <Text type="supporting">Low</Text>
          </HStack>
        )}
      </HStack>
    )},
    {
      key: 'available',
      header: '',
      width: pixel(110),
      renderCell: (it: any) => (
        <HStack gap={2} style={{ alignItems: 'center' }}>
          <StatusDot
            variant={it.is_available ? 'success' : 'neutral'}
            label={it.is_available ? 'On shelf' : 'Hidden'}
          />
          <Text type="supporting">{it.is_available ? 'On shelf' : 'Hidden'}</Text>
        </HStack>
      ),
    },
    {
      key: 'restock',
      header: 'Restock',
      width: pixel(160),
      renderCell: (it: InventoryItem) => (
        <RestockCell item={it} isSaving={restockingId === it.id} onRestock={(n) => restock(it, n)} />
      ),
    },
  ];

  return (
    <VStack gap={4}>
      <Card>
        <VStack gap={4}>
          <HStack gap={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={3}>Stock on hand</Heading>
            {lowStock.length > 0 && <Badge variant="warning" label={`${lowStock.length} running low`} />}
          </HStack>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (barcode.trim() && price.trim()) handleAdd();
            }}
          >
            <VStack gap={3}>
              <HStack gap={3} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <TextInput label="Product barcode" value={barcode} onChange={setBarcode} placeholder="Scan or type the barcode" htmlName="barcode" />
                <TextInput label="Item name" description="Only used the first time this barcode is stocked anywhere" value={name} onChange={setName} placeholder="e.g. White bread 700g" htmlName="item-name" />
                <TextInput label="Selling price (R)" value={price} onChange={setPrice} placeholder="85.00" htmlName="price" />
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
                  label="Add to stock"
                  variant="primary"
                  type="submit"
                  isDisabled={!barcode.trim() || !price.trim()}
                  isLoading={addMutation.isPending}
                />
              </HStack>
              <Collapsible trigger="Or scan with the camera" defaultIsOpen={false}>
                <BarcodeScanner
                  shopId={shopId}
                  onScan={(code) => setBarcode(code)}
                />
              </Collapsible>
            </VStack>
          </form>
        </VStack>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner size="md" />
        ) : isError ? (
          <Banner status="error" title="Can't load this shop's stock" description="Sign in as the owner of this shop and refresh." container="card" />
        ) : items.length === 0 ? (
          <Text type="body">No stock yet — add your first item above.</Text>
        ) : (
          <Table data={items as any} columns={columns as any} idKey="id" density="balanced" hasHover isStriped />
        )}
      </Card>
    </VStack>
  );
}

function RestockCell({
  item,
  isSaving,
  onRestock,
}: {
  item: InventoryItem;
  isSaving: boolean;
  onRestock: (addQty: number) => void;
}) {
  const [addQty, setAddQty] = useState<number | null>(null);
  const valid = addQty !== null && addQty > 0;

  return (
    <HStack gap={2} style={{ alignItems: 'center' }}>
      <NumberInput
        label="Add quantity"
        isLabelHidden
        value={addQty}
        onChange={setAddQty}
        min={1}
        isIntegerOnly
        placeholder="+ qty"
        width={80}
        htmlName={`restock-${item.id}`}
      />
      <Button
        label="Add"
        size="sm"
        variant="secondary"
        isDisabled={!valid || isSaving}
        isLoading={isSaving}
        onClick={() => {
          onRestock(addQty!);
          setAddQty(null);
        }}
      />
    </HStack>
  );
}
