/**
 * The service fee and the courier payout split, as pure arithmetic.
 *
 * Extracted from QuoteService and DeliveryService so the numbers three client
 * apps display can be tested without a database, a Nest context, or a config
 * module. These are the only two functions on the project that decide what a
 * customer is charged and what a courier is paid, so they are the first thing
 * that should ever have had a test.
 *
 * The model, and the worked examples the tests assert against, are fixed in
 * docs/API_CONTRACT.md § 9.1. If this file and § 9.1 ever disagree, § 9.1 is
 * right — the numbers are a commercial decision, not an implementation detail.
 *
 *   service_fee = base + per_extra_shop x (shops - 1) + per_km x ceil(km)
 */

export interface FeeConstants {
  baseCents: number;
  perExtraShopCents: number;
  perKmCents: number;
}

/** One line of the receipt. Shaped for the response, not for the maths. */
export interface FeeLine {
  label: string;
  amount_cents: number;
}

export interface ServiceFeeResult {
  totalCents: number;
  breakdown: FeeLine[];
}

export interface ServiceFeeInput {
  /**
   * Collection orders pay nothing — there is no courier. Passed in rather than
   * assumed by the caller so that "collection is free" is a rule this file
   * states and a test can pin, instead of an `if` somewhere up the stack.
   */
  isDelivery: boolean;
  shopCount: number;
  /** Furthest shop from the drop-off, in metres. Billed as whole km, rounded up. */
  maxDistanceM: number;
  fees: FeeConstants;
}

export function serviceFee(input: ServiceFeeInput): ServiceFeeResult {
  if (!input.isDelivery) return { totalCents: 0, breakdown: [] };

  const { fees } = input;
  const breakdown: FeeLine[] = [];
  let total = 0;

  total += fees.baseCents;
  breakdown.push({ label: 'Base service fee', amount_cents: fees.baseCents });

  const extraShops = Math.max(0, input.shopCount - 1);
  if (extraShops > 0) {
    const amount = fees.perExtraShopCents * extraShops;
    total += amount;
    breakdown.push({
      label: `Extra shop (${extraShops})`,
      amount_cents: amount,
    });
  }

  // Rounded UP, so a 1.2 km trip bills two kilometres. The courier walks the
  // whole of the second one.
  const km = Math.ceil(input.maxDistanceM / 1000);
  if (km > 0) {
    const amount = fees.perKmCents * km;
    total += amount;
    breakdown.push({ label: `Distance (${km} km)`, amount_cents: amount });
  }

  return { totalCents: total, breakdown };
}

/**
 * The courier's cut, fixed at the moment delivery is requested and then stored
 * on `deliveries.payout_cents` — so this runs once per delivery and its result
 * outlives any later change to the percentage.
 *
 * Rounds rather than truncates: at a 75% share an odd fee would otherwise
 * always round in the platform's favour, which is a bad default for the side
 * of the split that is carrying the cash.
 */
export function payoutCents(
  serviceFeeCents: number,
  courierSharePct: number,
): number {
  return Math.round((serviceFeeCents * courierSharePct) / 100);
}

/** What the platform keeps. Stated explicitly so the two always sum to the fee. */
export function platformCents(
  serviceFeeCents: number,
  courierSharePct: number,
): number {
  return serviceFeeCents - payoutCents(serviceFeeCents, courierSharePct);
}
