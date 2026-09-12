import {
  deriveOrderStatus,
  deriveSubtotalCents,
  deriveTotalCents,
} from './order-math';
import type { OrderShopStatus } from '../../generated/prisma/client';

const legs = (...statuses: OrderShopStatus[]) =>
  statuses.map((status) => ({ status }));

describe('deriveOrderStatus', () => {
  it('returns null for an order with no legs', () => {
    // Not `rejected`. No legs means the caller raced a delete, and writing a
    // status here would invent a decision nobody made.
    expect(deriveOrderStatus([])).toBeNull();
  });

  it('is placed while any shop has not answered', () => {
    // One shop accepting must NOT move the order — the customer is still
    // waiting on somebody, and saying `accepted` would be a lie to both.
    expect(deriveOrderStatus(legs('accepted', 'pending'))).toBe('placed');
    expect(deriveOrderStatus(legs('ready', 'pending'))).toBe('placed');
    expect(deriveOrderStatus(legs('pending'))).toBe('placed');
  });

  it('is accepted when every shop has taken its leg', () => {
    expect(deriveOrderStatus(legs('accepted', 'accepted'))).toBe('accepted');
  });

  it('is rejected only when every leg is dead', () => {
    expect(deriveOrderStatus(legs('rejected'))).toBe('rejected');
    expect(deriveOrderStatus(legs('rejected', 'rejected'))).toBe('rejected');
    expect(deriveOrderStatus(legs('rejected', 'cancelled'))).toBe('rejected');
  });

  it('is partially_accepted when the order shrank but survived', () => {
    // The contract says to build for this as the normal case, not the edge one.
    expect(deriveOrderStatus(legs('accepted', 'rejected'))).toBe(
      'partially_accepted',
    );
  });

  it('is ready when every surviving leg is ready, ignoring the dead ones', () => {
    expect(deriveOrderStatus(legs('ready', 'ready'))).toBe('ready');
    expect(deriveOrderStatus(legs('ready', 'rejected'))).toBe('ready');
  });

  it('counts a collected leg as ready', () => {
    // A courier has already taken that bag; the order is not less ready for it.
    expect(deriveOrderStatus(legs('collected', 'ready'))).toBe('ready');
    expect(deriveOrderStatus(legs('collected'))).toBe('ready');
  });

  it('prefers placed over ready when a shop is still deciding', () => {
    // Precedence, not alphabetical order: pending outranks everything except
    // "all dead", because it is the only state the customer can still lose.
    expect(deriveOrderStatus(legs('collected', 'pending'))).toBe('placed');
  });
});

describe('deriveSubtotalCents', () => {
  it('drops rejected legs from what the customer owes', () => {
    const subtotal = deriveSubtotalCents([
      { status: 'accepted', subtotalCents: BigInt(5000) },
      { status: 'rejected', subtotalCents: BigInt(3000) },
    ]);
    expect(subtotal).toBe(BigInt(5000));
  });

  it('keeps cancelled legs in the sum', () => {
    // Deliberate, and it matches the behaviour this replaced. A leg is only
    // `cancelled` when the whole order is, and a cancelled order's total is not
    // a number anybody collects — quietly changing it would be a repricing.
    const subtotal = deriveSubtotalCents([
      { status: 'cancelled', subtotalCents: BigInt(5000) },
    ]);
    expect(subtotal).toBe(BigInt(5000));
  });

  it('is zero for an empty order', () => {
    expect(deriveSubtotalCents([])).toBe(BigInt(0));
  });

  it('stays exact past the safe-integer range', () => {
    // Money is BigInt cents precisely so a large basket cannot drift. If this
    // ever came back as a Number the cents would start rounding.
    const big = BigInt(Number.MAX_SAFE_INTEGER) + BigInt(10);
    expect(
      deriveSubtotalCents([{ status: 'accepted', subtotalCents: big }]),
    ).toBe(big);
  });
});

describe('deriveTotalCents', () => {
  it('adds the fees fixed at quote time to the surviving subtotal', () => {
    expect(deriveTotalCents(BigInt(5000), BigInt(2150), BigInt(0))).toBe(
      BigInt(7150),
    );
  });

  it('does not discount the service fee when a leg is rejected', () => {
    // The courier still makes the trip for whatever survived, so the fee that
    // was quoted is the fee that is owed.
    const before = deriveTotalCents(BigInt(8000), BigInt(2150), BigInt(0));
    const after = deriveTotalCents(BigInt(5000), BigInt(2150), BigInt(0));
    expect(before - after).toBe(BigInt(3000));
  });
});
