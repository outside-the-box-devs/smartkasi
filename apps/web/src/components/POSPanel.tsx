'use client';

import { useState, useEffect } from 'react';
import { VStack, HStack } from '@astryxdesign/core/Stack';
import { Card } from '@astryxdesign/core/Card';
import { Heading, Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Badge } from '@astryxdesign/core/Badge';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { offlineDB } from '@/lib/offline-db';
import { salesApi } from '@/lib/api/sales';
import type { SalePayload } from '@/lib/api/sales';
import { catalogApi } from '@/lib/api/catalog';
import { rands } from '@/lib/api/inventory';
import { useFeedback } from '@/hooks/use-feedback';

type CartItem = { barcode: string; name: string; price_cents: number; qty: number };

export default function POSPanel({ shopId }: { shopId: string }) {
  const feedback = useFeedback();
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tendered, setTendered] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(true);

  const [queuedCount, setQueuedCount] = useState(0);
  useEffect(() => {
    offlineDB.getQueuedSales().then((q) => setQueuedCount(q.length)).catch(() => {});
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, [cart]);

  async function addScan() {
    const code = barcode.trim();
    if (!code) return;
    try {
      const item = await catalogApi.byBarcode(code, shopId);
      upsert({ barcode: code, name: item.name, price_cents: item.priceCents ?? 0 });
    } catch {
      upsert({ barcode: code, name: `Item ${code}`, price_cents: 0 });
    }
    setBarcode('');
  }

  function upsert(item: Omit<CartItem, 'qty'>) {
    setCart((c) => {
      const found = c.find((x) => x.barcode === item.barcode);
      if (found) return c.map((x) => (x.barcode === item.barcode ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...item, qty: 1 }];
    });
  }

  const subtotal = cart.reduce((s, it) => s + it.price_cents * it.qty, 0);
  const tenderedCents = Math.round(parseFloat(tendered || '0') * 100);
  const change = tenderedCents - subtotal;

  async function checkout() {
    if (cart.length === 0) return;
    const client_sale_id = crypto.randomUUID();
    const payload = {
      client_sale_id,
      items: cart.map((c) => ({ barcode: c.barcode, qty: c.qty, unit_price_cents: c.price_cents })),
      subtotal_cents: subtotal,
      total_cents: subtotal,
      amount_tendered_cents: tenderedCents > 0 ? tenderedCents : null,
      change_cents: Math.max(0, change),
      payment_method: 'cash',
      sold_at: new Date().toISOString(),
    };

    // Save first — the sale is never lost, even mid-sync.
    await offlineDB.queueSale({ client_sale_id, shopId, payload, createdAt: new Date().toISOString() });
    setQueuedCount((n) => n + 1);

    if (!navigator.onLine) {
      feedback.success(`Change to give: ${rands(Math.max(0, change))} — will sync when back online`, client_sale_id);
      finish();
      return;
    }
    setSyncing(true);
    try {
      await salesApi.pushBatch(shopId, [payload]);
      await offlineDB.clearQueuedSale(client_sale_id);
      setQueuedCount((n) => Math.max(0, n - 1));
      feedback.success(`Sold — change to give: ${rands(Math.max(0, change))}`, client_sale_id);
    } catch {
      feedback.error('Sale saved on this device — it will sync automatically', client_sale_id);
    }
    setSyncing(false);
    finish();
  }

  /** Clears the till for the next customer. Feedback goes through toasts. */
  function finish() {
    setCart([]);
    setTendered('');
  }

  async function syncAll() {
    const queued = (await offlineDB.getQueuedSales()) as Array<{
      client_sale_id: string;
      payload: SalePayload;
    }>;
    if (!queued.length) { feedback.success('Everything is already synced', 'sync'); return; }
    setSyncing(true);
    try {
      await salesApi.pushBatch(shopId, queued.map((s) => s.payload));
      for (const s of queued) await offlineDB.clearQueuedSale(s.client_sale_id);
      setQueuedCount(0);
      feedback.success(`All ${queued.length} saved sales synced`, 'sync');
    } catch {
      feedback.error("Can't reach the server — saved sales are safe, try again in a moment", 'sync');
    }
    setSyncing(false);
  }

  return (
    <VStack gap={4}>
      {!online && (
        <Banner status="warning" title="You're offline" description="Sales are saved on this device and sync when you're back online." />
      )}

      <Card>
        <VStack gap={4}>
          <HStack gap={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Heading level={3}>Ring up a sale</Heading>
            {queuedCount > 0 && <Badge variant="warning" label={`${queuedCount} waiting to sync`} />}
          </HStack>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addScan();
            }}
          >
            <HStack gap={3} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <TextInput label="Scan or type barcode" value={barcode} onChange={setBarcode} placeholder="6001068000456" htmlName="barcode" />
              <Button label="Add item" variant="secondary" type="submit" isDisabled={!barcode.trim()} />
            </HStack>
          </form>

          {cart.length === 0 ? (
            <Text type="body">No items yet — scan the first product.</Text>
          ) : (
            <VStack gap={2}>
              {cart.map((it) => (
                <HStack key={it.barcode} gap={3} className="sk-enter" style={{ justifyContent: 'space-between' }}>
                  <Text>{it.name} × {it.qty}</Text>
                  <Text style={{ fontWeight: 600 }}>{rands(it.price_cents * it.qty)}</Text>
                </HStack>
              ))}
              <Divider />
              <HStack gap={3} style={{ justifyContent: 'space-between' }}>
                <Heading level={4}>Total</Heading>
                <Heading level={4}>{rands(subtotal)}</Heading>
              </HStack>
            </VStack>
          )}

          <HStack gap={3} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextInput label="Cash received (R)" value={tendered} onChange={setTendered} placeholder="0.00" />
            <Card style={{ minWidth: 160 }}>
              <VStack gap={1}>
                <Text type="supporting">Change to give</Text>
                <Heading level={3}>{rands(Math.max(0, change))}</Heading>
              </VStack>
            </Card>
          </HStack>

          <HStack gap={2}>
            <Button label="Complete sale" variant="primary" isLoading={syncing} onClick={checkout} isDisabled={cart.length === 0} />
            {queuedCount > 0 && <Button label={`Sync ${queuedCount} saved`} variant="secondary" onClick={syncAll} />}
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );
}
