import { apiFetch, unwrap } from './client';

export interface ScannedProduct {
  productId: string;
  barcode: string;
  name: string;
  brand: string | null;
  unitSize: string | null;
  /** Price at the requested shop, when it stocks this item. */
  priceCents: number | null;
  stockQty: number | null;
}

export const catalogApi = {
  /** Look up a scanned barcode, optionally with shop-local price/stock. */
  async byBarcode(barcode: string, shopId?: string): Promise<ScannedProduct> {
    const qs = shopId ? `?shop_id=${shopId}` : '';
    const raw = await unwrap<any>(await apiFetch(`/products/barcode/${encodeURIComponent(barcode)}${qs}`));
    const p = raw.product ?? raw ?? {};
    const sp = raw.shop_product ?? raw.shopProduct ?? null;
    return {
      productId: p.id,
      barcode: p.barcode ?? barcode,
      name: p.name ?? `Item ${barcode}`,
      brand: p.brand ?? null,
      unitSize: p.unit_size ?? null,
      priceCents: sp?.price_cents ?? null,
      stockQty: sp?.stock_qty ?? null,
    };
  },

  /**
   * Resolve a scanned barcode to a product id — creating a catalog entry for
   * unknown barcodes (shop-local item) so inventory can reference it.
   *
   * `POST /products` returns the *existing* product (ignoring `name`) when
   * the barcode already matches one, so `name` only ever takes effect for a
   * genuinely new item — pass whatever the owner typed, and fall back to a
   * placeholder only if they left it blank.
   */
  async resolveBarcode(barcode: string, name?: string): Promise<{ id: string; name: string }> {
    const raw = await unwrap<any>(
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({ barcode, name: name?.trim() || `Item ${barcode}` }),
      }),
    );
    return { id: raw.id, name: raw.name };
  },
};
