'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { Table, proportional, pixel } from '@astryxdesign/core/Table';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Banner } from '@astryxdesign/core/Banner';
import { Spinner } from '@astryxdesign/core/Spinner';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { inventoryApi, rands } from '@/lib/api/inventory';
import { catalogApi } from '@/lib/api/catalog';
import { useInventory, useAddToStock } from '@/hooks/use-shops';
import { useFeedback } from '@/hooks/use-feedback';
import BarcodeScanner from '@/components/BarcodeScanner';

export default function InventoryPanel({ shopId }: { shopId: string }) {
  const qc = useQueryClient();
  const feedback = useFeedback();
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');

  const { data: items = [], isLoading, isError } = useInventory(shopId);
  const addMutation = useAddToStock(shopId);

  const lowStock = items.filter((it) => it.stock_qty <= it.low_stock_threshold);

  const handleAdd = async () => {
    try {
      // 1. Resolve the barcode to a product (creates a local item if unknown)
      const product = await catalogApi.resolveBarcode(barcode.trim());
      // 2. Put it on this shop's stock list at the selling price
      await inventoryApi.add(shopId, product.id, Math.round(parseFloat(price || '0') * 100));
      qc.invalidateQueries({ queryKey: ['inventory', shopId] });
      feedback.success(`${product.name} added to stock`, product.id);
      setBarcode('');
      setPrice('');
    } catch (e) {
      feedback.error(
        (e as { status?: number })?.status === 401
          ? 'Sign in as the shop owner to change stock.'
          : "Couldn't add that item — check the barcode and price.",
        'add-item',
      );
    }
  };

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
        {it.is_low_stock && <Badge variant="warning" label="Low" />}
      </HStack>
    )},
    {
      key: 'available',
      header: '',
      width: pixel(110),
      renderCell: (it: any) => (
        <Badge variant={it.is_available ? 'success' : 'neutral'} label={it.is_available ? 'On shelf' : 'Hidden'} />
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
                <TextInput label="Selling price (R)" value={price} onChange={setPrice} placeholder="85.00" htmlName="price" />
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
