import { apiFetch } from './client';

export interface SaleLine {
  barcode: string;
  qty: number;
  unit_price_cents: number;
}

export interface SalePayload {
  client_sale_id: string;
  items: SaleLine[];
  subtotal_cents: number;
  total_cents: number;
  amount_tendered_cents?: number | null;
  change_cents?: number;
  payment_method: string;
  sold_at: string;
}

export const salesApi = {
  /**
   * Flush one or more sales. Idempotent on client_sale_id — replaying a batch
   * after a lost connection never double-charges.
   */
  pushBatch(shopId: string, sales: SalePayload[]): Promise<void> {
    return apiFetch(`/shops/${shopId}/sales/batch`, {
      method: 'POST',
      body: JSON.stringify({ sales }),
    });
  },
};
