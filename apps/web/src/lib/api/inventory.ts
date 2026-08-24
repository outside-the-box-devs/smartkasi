import { apiFetch, unwrap, pick } from './client';

export interface InventoryProduct {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  unit_size: string | null;
}

export interface InventoryItem {
  id: string;
  shop_id: string;
  product_id: string;
  price_cents: number;
  stock_qty: number;
  low_stock_threshold: number;
  is_available: boolean;
  is_low_stock: boolean;
  product: InventoryProduct;
}

function toItem(raw: Record<string, any>): InventoryItem {
  const p = raw.product ?? {};
  return {
    id: raw.id,
    shop_id: pick(raw, 'shop_id') ?? '',
    product_id: pick(raw, 'product_id'),
    price_cents: Number(pick(raw, 'price_cents') ?? 0),
    stock_qty: Number(pick(raw, 'stock_qty') ?? 0),
    low_stock_threshold: Number(pick(raw, 'low_stock_threshold') ?? 5),
    is_available: pick<boolean>(raw, 'is_available') ?? true,
    is_low_stock: !!pick(raw, 'is_low_stock'),
    product: {
      id: p.id,
      barcode: p.barcode ?? null,
      name: p.name ?? 'Unknown item',
      brand: p.brand ?? null,
      unit_size: pick(p, 'unit_size') ?? null,
    },
  };
}

export const inventoryApi = {
  async list(shopId: string): Promise<InventoryItem[]> {
    const body = await apiFetch<any>(`/shops/${shopId}/inventory`);
    const rows = Array.isArray(body) ? body : (body?.data ?? []);
    return rows.map(toItem);
  },

  async lowStock(shopId: string): Promise<InventoryItem[]> {
    const body = await apiFetch<any>(`/shops/${shopId}/inventory/low-stock`);
    const rows = Array.isArray(body) ? body : (body?.data ?? []);
    return rows.map(toItem);
  },

  /** Adds a product to the shop's stock list at a given selling price. */
  add(shopId: string, productId: string, priceCents: number): Promise<unknown> {
    return apiFetch(`/shops/${shopId}/inventory`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, price_cents: priceCents }),
    });
  },
};

/** Format integer cents as Rands for display. */
export function rands(cents: number): string {
  return `R ${(cents / 100).toFixed(2)}`;
}
