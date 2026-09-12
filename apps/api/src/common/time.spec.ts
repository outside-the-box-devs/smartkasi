import { isOpenNow, saDayRangeUtc, timeToHHMM, timeToMinutes } from './time';

/**
 * Africa/Johannesburg is UTC+2 with no DST. Every assertion here is about the
 * same failure: a shop's takings landing in the wrong day's cash-up because a
 * boundary was computed in UTC.
 */
describe('saDayRangeUtc', () => {
  it('starts a SA day at 22:00 UTC the day before', () => {
    const { from, to } = saDayRangeUtc('2026-09-12');
    expect(from.toISOString()).toBe('2026-09-11T22:00:00.000Z');
    expect(to.toISOString()).toBe('2026-09-12T22:00:00.000Z');
  });

  it('covers exactly 24 hours', () => {
    const { from, to } = saDayRangeUtc('2026-09-12');
    expect(to.getTime() - from.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it('puts a 00:30 SA sale in the new SA day, not the previous one', () => {
    // 2026-09-13 00:30 SAST is 2026-09-12 22:30 UTC. Bucketing by UTC date
    // would file this under the 12th and short that morning's cash-up.
    const sale = new Date('2026-09-12T22:30:00.000Z');
    const twelfth = saDayRangeUtc('2026-09-12');
    const thirteenth = saDayRangeUtc('2026-09-13');
    expect(sale >= twelfth.from && sale < twelfth.to).toBe(false);
    expect(sale >= thirteenth.from && sale < thirteenth.to).toBe(true);
  });

  it('keeps a 23:30 SA sale in that SA day', () => {
    // The other side of the same boundary: 21:30 UTC is still the 12th in SA.
    const { from, to } = saDayRangeUtc('2026-09-12');
    const sale = new Date('2026-09-12T21:30:00.000Z');
    expect(sale >= from && sale < to).toBe(true);
  });

  it('hands consecutive days off without a gap or an overlap', () => {
    expect(saDayRangeUtc('2026-09-12').to.toISOString()).toBe(
      saDayRangeUtc('2026-09-13').from.toISOString(),
    );
  });

  it('crosses a month boundary', () => {
    const { from } = saDayRangeUtc('2026-10-01');
    expect(from.toISOString()).toBe('2026-09-30T22:00:00.000Z');
  });
});

describe('timeToMinutes / timeToHHMM', () => {
  // Postgres `time` arrives as a Date pinned to 1970-01-01 UTC, so the
  // time-of-day lives in the UTC fields. Reading the local ones would shift
  // every shop's opening hours by the server's offset.
  const at = (hhmm: string) => new Date('1970-01-01T' + hhmm + ':00.000Z');

  it('reads a Postgres time column out of its UTC fields', () => {
    expect(timeToMinutes(at('07:30'))).toBe(450);
    expect(timeToHHMM(at('07:30'))).toBe('07:30');
  });

  it('zero-pads a single-digit hour', () => {
    expect(timeToHHMM(at('06:05'))).toBe('06:05');
  });

  it('passes null through rather than inventing a time', () => {
    expect(timeToMinutes(null)).toBeNull();
    expect(timeToHHMM(null)).toBeNull();
  });
});

describe('isOpenNow', () => {
  const at = (hhmm: string) => new Date('1970-01-01T' + hhmm + ':00.000Z');

  // isOpenNow reads the wall clock, so these pin it. 21:00 UTC is 23:00 SAST.
  const atSaTime = (utcIso: string, fn: () => void) => {
    jest.useFakeTimers().setSystemTime(new Date(utcIso));
    try {
      fn();
    } finally {
      jest.useRealTimers();
    }
  };

  it('treats a shop with no hours set as always open', () => {
    // Documented behaviour, asserted so that changing it is a decision rather
    // than an accident: a shop that never filled in its hours stays findable.
    expect(isOpenNow(null, null)).toBe(true);
    expect(isOpenNow(at('08:00'), null)).toBe(true);
  });

  it('handles a shop that closes after midnight', () => {
    // 20:00 -> 02:00 must not read as an empty window.
    atSaTime('2026-09-12T21:00:00.000Z', () => {
      expect(isOpenNow(at('20:00'), at('02:00'))).toBe(true);
    });
    // 15:00 SAST is outside it.
    atSaTime('2026-09-12T13:00:00.000Z', () => {
      expect(isOpenNow(at('20:00'), at('02:00'))).toBe(false);
    });
  });

  it('closes a normal daytime shop outside its hours', () => {
    atSaTime('2026-09-12T06:00:00.000Z', () => {
      // 08:00 SAST, inside 07:00-18:00.
      expect(isOpenNow(at('07:00'), at('18:00'))).toBe(true);
    });
    atSaTime('2026-09-12T19:00:00.000Z', () => {
      // 21:00 SAST, outside 07:00-18:00.
      expect(isOpenNow(at('07:00'), at('18:00'))).toBe(false);
    });
  });
});
