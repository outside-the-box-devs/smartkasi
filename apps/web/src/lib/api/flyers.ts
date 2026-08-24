import { apiFetch, unwrap } from './client';

export interface Flyer {
  id: string;
  shop_id: string;
  title: string;
  image_url: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export const flyersApi = {
  async list(shopId: string): Promise<Flyer[]> {
    const rows = await unwrap<any[]>(await apiFetch(`/shops/${shopId}/flyers`));
    return (Array.isArray(rows) ? rows : []).map((f: any) => ({
      id: f.id,
      shop_id: f.shop_id ?? f.shopId,
      title: f.title,
      image_url: f.image_url ?? f.imageUrl,
      starts_at: (f.starts_at ?? f.startsAt ?? '').slice(0, 10),
      ends_at: (f.ends_at ?? f.endsAt ?? '').slice(0, 10),
      is_active: f.is_active ?? f.isActive ?? true,
    }));
  },

  create(
    shopId: string,
    body: { title: string; image_url: string; starts_at: string; ends_at: string },
  ): Promise<void> {
    return apiFetch(`/shops/${shopId}/flyers`, { method: 'POST', body: JSON.stringify(body) });
  },
};
