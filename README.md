# SmartKasi

Hyperlocal spaza commerce for South African townships — offline-capable POS, a
shared product catalog with cross-shop price comparison, multi-shop marketplace
orders, and (v2) courier delivery.

**Backend deadline: Sat 22 Aug 2026, 10:00 SAST.**

The Prism mock is gone. `https://api-production-5594.up.railway.app/v1` is the
only SmartKasi API, and every delivery endpoint on it is real.

## Start here

| If you are… | Read |
|---|---|
| Building the Flutter apps | [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md), then `apps/mobile/README.md` |
| Building the Next.js dashboard | Same, plus `packages/contract/openapi.yaml` for typed client generation |
| Building the backend | [`apps/api/README.md`](apps/api/README.md) and [`docs/ERD.md`](docs/ERD.md) |
| Deciding what to cut tonight | [`docs/BUILD_ORDER.md`](docs/BUILD_ORDER.md) |
| Testing a running API | [`docs/TESTING.md`](docs/TESTING.md) — or just `cd apps/api && npm run smoke:auth` |

## Layout

```
apps/api/                 NestJS + Prisma. Every LIVE endpoint, working.
apps/web/                 Next.js admin dashboard.
packages/contract/        openapi.yaml — the contract. Frozen; additive changes only.
db/schema.sql             Postgres/Supabase schema. Source of truth (triggers, RLS, constraints).
db/seed.sql               3 Soweto shops, 12 real SA products, a week of POS sales, one live order.
db/reset.sql              Empties the demo data so the seed can be re-applied. Destructive.
supabase/migrations/      Mirrored copy of db/schema.sql for `supabase db reset` (see AGENTS.md).
supabase/seed.sql         Mirrored copy of db/seed.sql for `supabase/config.toml:71` sql_paths.
docs/                     API_CONTRACT, ERD, BUILD_ORDER.
```

## Commands

```bash
npm install               # workspaces: apps/* and packages/*
npm run smoke:auth --workspace api  # 36 checks against a running API
npm run contract:lint     # validate the contract
npm run dev               # turbo dev across apps
```

## The 90-second version

**Money is integer cents.** Every field ends `_cents`. `1850` = R18.50.

**Auth is Supabase.** This API issues no tokens and has no `/login`. Clients
sign in with the Supabase SDK and send the access token; the API verifies it.

**Offline is one unique constraint.** The till generates `client_sale_id` at the
moment of sale and keeps it. `@@unique([shopId, clientSaleId])` means a replayed
batch produces one sale. There is no sync engine on the server and there should
not be one — this is the single biggest scope saving on the project.

**Stock is a ledger**, not a counter, so replaying a week of offline sales is
safe and "why is my stock wrong?" is a query.

**One global product catalog keyed on barcode**, because price comparison across
shops is impossible if each shop owns its own product list.

**No PostGIS** — Prisma cannot read a `geography` column, so coordinates are
plain doubles with a bounding box in SQL and haversine in Node. Fine at demo
scale; see `docs/ERD.md` § 5 for exactly what it costs.

**Courier position is never sent to a customer.** No coordinates, no route, no
ETA more precise than a band. A live route in a township tells anyone holding the
phone where a person carrying cash will be, and when. See
`docs/API_CONTRACT.md` § Route privacy — and do not add a moving pin "just for
the demo".

## Verified, not just written

The schema and seed are applied to the live Supabase project
(`wndilblmkkdyzpffmwap`, eu-west-1), and **all 24 smoke checks pass against it**.
Auth is JWKS/ES256 — verified with a real signed-in user, not inferred.
Confirmed working:

- Price comparison across three shops with avg/min/max
- Geo radius that actually excludes — a shop 3085 m away is dropped at `radius_m=3000`
- Barcode scan returning shop price + stock in one round trip
- Offline batch replay → one sale row, two correct ledger entries
- Mixed batch → `207` with per-sale `created` / `duplicate` / `failed`
- Daily cash-up bucketed by the Africa/Johannesburg day
- Quote → order → shop A accepts, shop B rejects → `partially_accepted`,
  total recalculated from R146.98 to R103.00
- Shop B accepting shop A's leg → `403`
- Reusing a spent quote → `409`; ordering from an advertising-only shop → `422`
- Courier dispatch end to end: request → job board → accept → collect → handover,
  with the order landing on `completed` and a second courier's accept losing
  the race with a `409`

## Open questions for the team

Answer before Sunday, not during integration. Full list at the bottom of
`docs/API_CONTRACT.md`; the two that block client code:

1. **Service fee constants.** Currently R10 base + R5 per extra shop + R1.50/km.
   Are those the demo numbers?
2. **Max basket spread.** `SHOPS_TOO_FAR_APART` fires beyond 2 km. Right number?
