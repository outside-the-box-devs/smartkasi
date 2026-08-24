// Order queue hooks — one shop at a time, 20s polling per the API contract.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/orders';
import type { OrderShopStatus } from '@/lib/api/orders';

const TWENTY_SECONDS = 20_000;

export function useShopOrders(shopId: string | undefined, status: 'all' | OrderShopStatus) {
  return useQuery({
    queryKey: ['shop-orders', shopId, status],
    queryFn: () => ordersApi.listShopOrders(shopId!, status === 'all' ? undefined : status),
    enabled: !!shopId,
    refetchInterval: TWENTY_SECONDS,
  });
}

/** Accept a pending leg. Pass { orderId } to mutate. */
export function useAcceptLeg(shopId: string | undefined, status: 'all' | OrderShopStatus) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: string }) => ordersApi.acceptLeg(orderId, shopId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop-orders', shopId, status] }),
  });
}

/** Reject a pending leg (reason: out of stock). Pass { orderId } to mutate. */
export function useRejectLeg(shopId: string | undefined, status: 'all' | OrderShopStatus) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: string }) =>
      ordersApi.rejectLeg(orderId, shopId!, 'out_of_stock'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop-orders', shopId, status] }),
  });
}

/** Mark an accepted leg ready for courier pickup. Pass { orderId } to mutate. */
export function useReadyLeg(shopId: string | undefined, status: 'all' | OrderShopStatus) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: string }) => ordersApi.readyLeg(orderId, shopId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shop-orders', shopId, status] }),
  });
}