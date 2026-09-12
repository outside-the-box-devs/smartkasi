import { payoutCents, platformCents, serviceFee } from './fee-math';
import type { FeeConstants } from './fee-math';

/**
 * The numbers below are not invented for the test. They are the worked examples
 * in docs/API_CONTRACT.md § 9.1, decided 2026-08-24. If a change to the code
 * makes one of these fail, the code is wrong — changing a number here is a
 * commercial decision and belongs in the contract first.
 */
const FEES: FeeConstants = {
  baseCents: 1800, // R18.00
  perExtraShopCents: 600, // R6.00
  perKmCents: 350, // R3.50
};
const COURIER_SHARE_PCT = 75;

describe('serviceFee', () => {
  it('charges nothing for a collection order', () => {
    const { totalCents, breakdown } = serviceFee({
      isDelivery: false,
      shopCount: 3,
      maxDistanceM: 9000,
      fees: FEES,
    });
    // Not "roughly zero" — a collection customer must never see a fee line at
    // all, because there is no courier and nothing to explain.
    expect(totalCents).toBe(0);
    expect(breakdown).toEqual([]);
  });

  it('prices one shop at 1 km as R21.50 (contract § 9.1)', () => {
    expect(
      serviceFee({
        isDelivery: true,
        shopCount: 1,
        maxDistanceM: 1000,
        fees: FEES,
      }).totalCents,
    ).toBe(2150);
  });

  it('prices two shops at 2 km as R31.00 (contract § 9.1)', () => {
    expect(
      serviceFee({
        isDelivery: true,
        shopCount: 2,
        maxDistanceM: 2000,
        fees: FEES,
      }).totalCents,
    ).toBe(3100);
  });

  it('bills a part-kilometre as a whole one', () => {
    // 1.2 km must bill two, not one: the courier walks the whole of the second.
    const short = serviceFee({
      isDelivery: true,
      shopCount: 1,
      maxDistanceM: 1200,
      fees: FEES,
    });
    expect(short.totalCents).toBe(1800 + 350 * 2);
  });

  it('charges no distance line when the drop-off is at the shop', () => {
    const { totalCents, breakdown } = serviceFee({
      isDelivery: true,
      shopCount: 1,
      maxDistanceM: 0,
      fees: FEES,
    });
    expect(totalCents).toBe(1800);
    expect(breakdown.map((l) => l.label)).toEqual(['Base service fee']);
  });

  it('charges for extra shops, not for the first one', () => {
    const one = serviceFee({
      isDelivery: true,
      shopCount: 1,
      maxDistanceM: 0,
      fees: FEES,
    });
    const three = serviceFee({
      isDelivery: true,
      shopCount: 3,
      maxDistanceM: 0,
      fees: FEES,
    });
    expect(three.totalCents - one.totalCents).toBe(600 * 2);
  });

  it('breakdown always sums to the total it is explaining', () => {
    // The breakdown is shown on the receipt. If it ever disagrees with the
    // total, the customer is looking at arithmetic that does not add up.
    for (const shopCount of [1, 2, 5]) {
      for (const maxDistanceM of [0, 400, 1000, 2600]) {
        const { totalCents, breakdown } = serviceFee({
          isDelivery: true,
          shopCount,
          maxDistanceM,
          fees: FEES,
        });
        const summed = breakdown.reduce((a, l) => a + l.amount_cents, 0);
        expect(summed).toBe(totalCents);
      }
    }
  });
});

describe('payoutCents', () => {
  it('splits R21.50 as R16.13 courier / R5.37 platform (contract § 9.1)', () => {
    expect(payoutCents(2150, COURIER_SHARE_PCT)).toBe(1613);
    expect(platformCents(2150, COURIER_SHARE_PCT)).toBe(537);
  });

  it('splits R31.00 as R23.25 courier / R7.75 platform (contract § 9.1)', () => {
    expect(payoutCents(3100, COURIER_SHARE_PCT)).toBe(2325);
    expect(platformCents(3100, COURIER_SHARE_PCT)).toBe(775);
  });

  it('never loses or invents a cent', () => {
    // The two halves are stored separately — the courier's on the delivery row,
    // the platform's implied by subtraction. A rounding rule that let them drift
    // would show up as money appearing or vanishing at reconciliation.
    for (let fee = 0; fee <= 5000; fee += 7) {
      expect(
        payoutCents(fee, COURIER_SHARE_PCT) +
          platformCents(fee, COURIER_SHARE_PCT),
      ).toBe(fee);
    }
  });

  it('rounds a half-cent to the courier, not the platform', () => {
    // 2150 * 0.75 = 1612.5. Truncating would pay 1612 and hand the half-cent to
    // the platform on every odd fee, which is the wrong default for the side
    // carrying the cash.
    expect(payoutCents(2150, 75)).toBe(1613);
  });

  it('pays nothing on a zero fee', () => {
    expect(payoutCents(0, COURIER_SHARE_PCT)).toBe(0);
  });
});
