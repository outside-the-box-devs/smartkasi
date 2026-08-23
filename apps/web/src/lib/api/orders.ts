import { apiFetch, pick } from './client';

export type OrderShopStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'preparing'
  | 'ready'
  | 'collected'
  | 'cancelled';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  qty: number;
  fulfilled_qty: number | null;
  unit_price_cents: number;
  line_total_cents: number;
}

/** A shop's own view of one order leg — only what that shop needs to pack a bag. */
export interface ShopOrderLeg {
  id: string;
  order_id: string;
  order_number: string;
  status: OrderShopStatus;
  fulfilment_type: 'delivery' | 'collection';
  customer_first_name: string;
  subtotal_cents: number;
  items: OrderItem[];
  placed_at: string;
}

function toLeg(raw: Record<string, unknown>): ShopOrderLeg {
  return {
    id: String(raw.id ?? ''),
    order_id: pick<string>(raw, 'order_id') ?? '',
    order_number: pick<string>(raw, 'order_number') ?? '',
    status: (pick<string>(raw, 'status') ?? 'pending') as OrderShopStatus,
    fulfilment_type: (pick<string>(raw, 'fulfilment_type') ?? 'delivery') as ShopOrderLeg['fulfilment_type'],
    customer_first_name: pick<string>(raw, 'customer_first_name') ?? '',
    subtotal_cents: Number(pick(raw, 'subtotal_cents') ?? 0),
    items: Array.isArray(raw.items) ? (raw.items as OrderItem[]) : [],
    placed_at: pick<string>(raw, 'placed_at') ?? '',
  };
}

export const ordersApi = {
  /** Shop order queue — poll every 20s per the contract. */
  async listShopOrders(shopId: string, status?: OrderShopStatus): Promise<ShopOrderLeg[]> {
    const qs = status ? `?status=${status}` : '';
    const body = await apiFetch<unknown>(`/shops/${shopId}/orders${qs}`);
    const envelope = body as { data?: unknown[] } | unknown[] | null;
    const rows = Array.isArray(envelope) ? envelope : (envelope?.data ?? []);
    return (rows as Record<string, unknown>[]).map(toLeg);
  },

  acceptLeg(orderId: string, shopId: string): Promise<void> {
    return apiFetch(`/orders/${orderId}/legs/${shopId}/accept`, { method: 'POST' });
  },

  rejectLeg(orderId: string, shopId: string, reason: string): Promise<void> {
    return apiFetch(`/orders/${orderId}/legs/${shopId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  readyLeg(orderId: string, shopId: string): Promise<void> {
    return apiFetch(`/orders/${orderId}/legs/${shopId}/ready`, { method: 'POST' });
  },
};

export function friendlyOrderStatus(s: OrderShopStatus): string {
  switch (s) {
    case 'pending': return 'Pending';
    case 'accepted': return 'Accepted';
    case 'rejected': return 'Rejected';
    case 'preparing': return 'Preparing';
    case 'ready': return 'Ready for pickup';
    case 'collected': return 'Collected';
    case 'cancelled': return 'Cancelled';
    default: return s;
  }
}