import { apiFetch, unwrap, pick } from './client';

export type ShopMode = 'advertising_only' | 'inventory_only' | 'full';
export type LicenceStatus = 'none' | 'pending' | 'verified' | 'rejected' | 'expired';

export interface ShopSummary {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  township: string | null;
  city: string | null;
  licence_status: LicenceStatus;
  mode: ShopMode;
  accepts_orders: boolean;
  accepts_delivery: boolean;
  is_active: boolean;
}

export interface ShopDetail extends ShopSummary {
  description: string | null;
  address_line: string;
  phone: string | null;
  trading_licence_no: string | null;
  licence_doc_url: string | null;
}

function toShop(raw: Record<string, unknown>): ShopSummary {
  const mode = pick<string>(raw, 'mode') ?? 'full';
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    slug: pick<string>(raw, 'slug') ?? '',
    lat: Number(pick(raw, 'lat') ?? 0),
    lng: Number(pick(raw, 'lng') ?? 0),
    township: pick<string>(raw, 'township') ?? null,
    city: pick<string>(raw, 'city') ?? null,
    licence_status: (pick<string>(raw, 'licence_status') ?? 'none') as LicenceStatus,
    mode: mode as ShopMode,
    accepts_orders: !!pick<boolean>(raw, 'accepts_orders'),
    accepts_delivery: !!pick<boolean>(raw, 'accepts_delivery'),
    is_active: pick<boolean>(raw, 'is_active') ?? true,
  };
}

function toDetail(raw: Record<string, unknown>): ShopDetail {
  return {
    ...toShop(raw),
    description: pick<string>(raw, 'description') ?? null,
    address_line: pick<string>(raw, 'address_line') ?? '',
    phone: pick<string>(raw, 'phone') ?? null,
    trading_licence_no: pick<string>(raw, 'trading_licence_no') ?? null,
    licence_doc_url: pick<string>(raw, 'licence_doc_url') ?? null,
  };
}

export interface ListShopsParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius_m?: number;
  /** "me" scopes the listing to the signed-in owner's shops (dashboard). */
  owner_id?: 'me';
}

export const shopsApi = {
  async list(params: ListShopsParams = {}): Promise<ShopSummary[]> {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.lat != null) qs.set('lat', String(params.lat));
    if (params.lng != null) qs.set('lng', String(params.lng));
    if (params.radius_m != null) qs.set('radius_m', String(params.radius_m));
    if (params.owner_id) qs.set('owner_id', params.owner_id);
    const suffix = qs.toString() ? `?${qs}` : '';
    const data = await unwrap<unknown[]>(await apiFetch(`/shops${suffix}`));
    return (Array.isArray(data) ? data : []).map((r) => toShop(r as Record<string, unknown>));
  },

  async get(id: string): Promise<ShopDetail> {
    const raw = await unwrap<Record<string, unknown>>(await apiFetch(`/shops/${id}`));
    return toDetail(raw);
  },

  submitLicence(shopId: string, docUrl: string, licenceNo: string): Promise<void> {
    return apiFetch(`/shops/${shopId}/licence`, {
      method: 'POST',
      body: JSON.stringify({ licence_doc_url: docUrl, trading_licence_no: licenceNo }),
    });
  },

  /** Register a new shop. Required: name, address_line, lat, lng. */
  async create(input: {
    name: string;
    address_line: string;
    township?: string;
    city?: string;
    province?: string;
    phone?: string;
    description?: string;
    lat: number;
    lng: number;
  }): Promise<ShopDetail> {
    const raw = await unwrap<Record<string, unknown>>(
      await apiFetch('/shops', { method: 'POST', body: JSON.stringify(input) }),
    );
    return toDetail(raw);
  },
};

export function friendlyLicence(s: LicenceStatus): string {
  switch (s) {
    case 'verified': return 'Verified';
    case 'pending': return 'Under review';
    case 'rejected': return 'Rejected';
    case 'expired': return 'Expired';
    default: return 'Not submitted';
  }
}