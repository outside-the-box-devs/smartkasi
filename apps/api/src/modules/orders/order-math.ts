import type {
  OrderShopStatus,
  OrderStatus,
} from '../../generated/prisma/client';

/**
 * The order state machine, as pure arithmetic over its legs.
 *
 * A multi-shop order has no status of its own — it only has whatever its legs
 * add up to. Extracted from `OrdersService.recomputeOrder` so that every
 * transition can be asserted without a database, because the alternative is
 * discovering a wrong one from a customer whose basket says `accepted` while a
 * shop is still looking at it.
 */

/** Legs a shop has turned down, or that were cancelled with the order. */
const DEAD: OrderShopStatus[] = ['rejected', 'cancelled'];

export interface LegForStatus {
  status: OrderShopStatus;
}

export interface LegForTotal {
  status: OrderShopStatus;
  subtotalCents: bigint;
}

/**
 * Precedence matters and is not alphabetical:
 *
 *   1. Every leg dead        -> `rejected`. Nobody is filling this.
 *   2. Any leg still pending -> `placed`. One shop's acceptance does not move
 *      the order; the customer is still waiting on somebody.
 *   3. Every live leg ready  -> `ready`. `collected` counts as ready because a
 *      courier has already taken that bag.
 *   4. Some legs dead        -> `partially_accepted`. The order shrank but
 *      survives — the contract says to build for this as the normal case.
 *   5. Otherwise             -> `accepted`.
 *
 * `completed` is deliberately NOT derived here: it is a fulfilment event, not a
 * property of the legs, and it is written where handover happens.
 */
export function deriveOrderStatus(legs: LegForStatus[]): OrderStatus | null {
  // No legs at all is not a state — it means the caller raced a delete. The
  // null tells them to leave the order alone rather than write `rejected`.
  if (legs.length === 0) return null;

  const statuses = legs.map((l) => l.status);
  const live = statuses.filter((s) => !DEAD.includes(s));

  if (live.length === 0) return 'rejected';
  if (statuses.includes('pending')) return 'placed';
  if (live.every((s) => s === 'ready' || s === 'collected')) return 'ready';
  if (live.length < statuses.length) return 'partially_accepted';
  return 'accepted';
}

/**
 * What the customer owes, once the rejected legs fall away.
 *
 * Note `cancelled` legs are NOT excluded, matching the behaviour this replaces.
 * A leg is only `cancelled` when the whole order is, and a cancelled order's
 * total is not a number anybody collects — changing it here would be a silent
 * repricing dressed up as a refactor.
 */
export function deriveSubtotalCents(legs: LegForTotal[]): bigint {
  return legs
    .filter((l) => l.status !== 'rejected')
    .reduce((sum, l) => sum + l.subtotalCents, BigInt(0));
}

/** Fees are fixed at quote time and do not move when a leg is rejected. */
export function deriveTotalCents(
  subtotalCents: bigint,
  serviceFeeCents: bigint,
  deliveryFeeCents: bigint,
): bigint {
  return subtotalCents + serviceFeeCents + deliveryFeeCents;
}
