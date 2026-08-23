// React Query hooks — one module per domain, reusable across pages.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopsApi } from '@/lib/api/shops';
import { inventoryApi } from '@/lib/api/inventory';
import type { ListShopsParams } from '@/lib/api/shops';

const FIVE_MIN = 5 * 60_000;

export function useShops(params: ListShopsParams = {}) {
  return useQuery({
    queryKey: ['shops', params],
    queryFn: () => shopsApi.list(params),
    staleTime: FIVE_MIN,
  });
}

export function useShop(id: string) {
  return useQuery({
    queryKey: ['shop', id],
    queryFn: () => shopsApi.get(id),
    enabled: !!id,
  });
}

export function useInventory(shopId: string) {
  return useQuery({
    queryKey: ['inventory', shopId],
    queryFn: () => inventoryApi.list(shopId),
    enabled: !!shopId,
  });
}

export function useLowStock(shopIds: string[]) {
  const key = shopIds.join(',');
  return useQuery({
    queryKey: ['low-stock', key],
    queryFn: async () => {
      const all = [];
      for (const id of shopIds) {
        try {
          all.push(...(await inventoryApi.lowStock(id)).map((it) => ({ ...it, shopId: id })));
        } catch {}
      }
      return all;
    },
    enabled: shopIds.length > 0,
    refetchInterval: 2 * FIVE_MIN,
  });
}

export function useAddToStock(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, priceCents }: { productId: string; priceCents: number }) =>
      inventoryApi.add(shopId, productId, priceCents),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory', shopId] }),
  });
}

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof shopsApi.create>[0]) => shopsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shops'] }),
  });
}
