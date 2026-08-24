const SA_OFFSET_HOURS = 2; // Africa/Johannesburg, no DST — safe as a constant.

/**
 * UTC window covering one calendar day in Africa/Johannesburg.
 *
 * The daily cash-up must bucket by the shop's local day, and Prisma cannot
 * express `at time zone`. Converting the boundaries here keeps the query a
 * plain indexed range scan on sold_at.
 */
export function saDayRangeUtc(isoDate: string): { from: Date; to: Date } {
  const from = new Date(`${isoDate}T00:00:00.000Z`);
  from.setUTCHours(from.getUTCHours() - SA_OFFSET_HOURS);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);
  return { from, to };
}

/** Today's date in Africa/Johannesburg, as YYYY-MM-DD. */
export function saToday(): string {
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + SA_OFFSET_HOURS);
  return now.toISOString().slice(0, 10);
}

/** Current wall-clock minutes since midnight in Africa/Johannesburg. */
export function saMinutesNow(): number {
  const now = new Date();
  const h = (now.getUTCHours() + SA_OFFSET_HOURS) % 24;
  return h * 60 + now.getUTCMinutes();
}

/**
 * Prisma returns a `@db.Time` column as a Date pinned to 1970-01-01 UTC, so
 * the time-of-day lives in the UTC fields, not the local ones.
 */
export function timeToMinutes(value: Date | null): number | null {
  if (!value) return null;
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

export function timeToHHMM(value: Date | null): string | null {
  const mins = timeToMinutes(value);
  if (mins === null) return null;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

export function isOpenNow(
  opensAt: Date | null,
  closesAt: Date | null,
): boolean {
  const open = timeToMinutes(opensAt);
  const close = timeToMinutes(closesAt);
  if (open === null || close === null) return true; // no hours set => always open
  const now = saMinutesNow();
  // Handles a shop that closes after midnight.
  return close >= open
    ? now >= open && now <= close
    : now >= open || now <= close;
}
