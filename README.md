# SmartKasi

Hyperlocal spaza commerce for South African townships — offline-capable POS, a
shared product catalog with cross-shop price comparison, multi-shop marketplace
orders, and courier delivery.

Backend shipped on the 22 Aug 2026 deadline. The Prism mock is gone;
`https://api-production-5594.up.railway.app/v1` is the only SmartKasi API, and
every delivery endpoint on it is real. Work since then has been the **web owner
dashboard** (`apps/web`) and the **Prisma-owned database migration story**.

## Start here

| If you are… | Read |
|---|---|
| Building the Flutter apps | [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md), then [`apps/mobile/README.md`](apps/mobile/README.md) |
| Building the Next.js dashboard | [`apps/web/README.md`](apps/web/README.md), plus `packages/contract/openapi.yaml` for typed client generation |
| Building the backend | [`apps/api/README.md`](apps/api/README.md) and [`docs/ERD.md`](docs/ERD.md) |
| Touching `db/`, `supabase/` or `prisma/` | [`AGENTS.md`](AGENTS.md) — **read it first**, the DB has one owner and it is Prisma |
| Deciding what to cut | [`docs/BUILD_ORDER.md`](docs/BUILD_ORDER.md) |
| About to open a pull request | [`CONTRIBUTING.md`](CONTRIBUTING.md) — branch names, the schema-mirror steps, what to verify by hand |
| Testing a running API | [`docs/TESTING.md`](docs/TESTING.md) — or `cd apps/api && npm run smoke:auth` |

## Layout

```
apps/api/                 NestJS + Prisma. Every LIVE endpoint, working.
apps/api/prisma/          schema.prisma + migrations — DB source of truth (see AGENTS.md).
apps/api/prisma/seed.ts   Creates auth.users via GoTrue, then applies db/seed.sql.
apps/web/                 Next.js 16 owner dashboard + offline POS. Port 3001.
apps/mobile/              Flutter: customer_app, shop_owner_app, delivery_app,
                          all sharing packages/smartkasi_shared.
packages/contract/        openapi.yaml — the contract. Frozen; additive changes only.
packages/theme/           @smartkasi/theme — tokens.json shared by web (Astryx) and Flutter.
db/schema.sql             Generated reference copy of the Prisma initial migration.
db/seed.sql               3 Soweto shops, 12 real SA products, a week of POS sales, one live order.
db/reset.sql              Empties the demo data so the seed can be re-applied. Destructive.
supabase/migrations/      Storage buckets + policies ONLY (DB is Prisma's, see AGENTS.md).
supabase/seed.sql         Supabase-only placeholder ([db.seed] is disabled on purpose).
docs/                     API_CONTRACT, ERD, BUILD_ORDER, TESTING.
```

## Commands

```bash
npm install                            # workspaces: apps/* and packages/*
npm run dev                            # turbo dev — api on :3000, web on :3001
npm run contract:lint                  # validate the contract
npm run supabase:start                 # local Supabase (Docker); storage only, DB stays empty

# database — from apps/api, and read AGENTS.md before changing anything
npx prisma migrate deploy              # create tables, views, triggers, RLS
npm run db:users                       # the five demo users, via the GoTrue Admin API
npx prisma db seed                     # demo data; idempotent

# tests
cd apps/api && npm run smoke:auth      # 39 end-to-end checks against a running API
cd apps/web  && npx playwright test    # Playwright e2e against localhost:3001
```

## The 90-second version

**Money is integer cents.** Every field ends `_cents`. `1850` = R18.50.

**Auth is Supabase.** This API issues no tokens and has no `/login`. Clients
sign in with the Supabase SDK and send the access token; the API verifies it
against the JWKS endpoint (this project signs ES256, so `SUPABASE_JWT_SECRET`
stays blank).

**Prisma owns the database; Supabase owns auth and storage.** One source of
truth for `public.*` — `apps/api/prisma/schema.prisma`. `supabase/migrations/`
may only ever contain `storage.*` objects. Putting a table in the wrong place is
what destroyed the local DB on 22 Aug; see [`AGENTS.md`](AGENTS.md) § 2.

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

**One token file, two platforms.** `packages/theme/src/tokens.json` is the
source; web consumes it through Astryx, Flutter reads the generated Dart. Do not
hardcode a colour in either app.

**Courier position is never sent to a customer.** No coordinates, no route, no
ETA more precise than a band. A live route in a township tells anyone holding the
phone where a person carrying cash will be, and when. See
`docs/API_CONTRACT.md` § Route privacy — and do not add a moving pin "just for
the demo".

## Verified, not just written

The schema and seed are applied to the live Supabase project
(`wndilblmkkdyzpffmwap`, eu-west-1), and **all 36 smoke checks passed against it**
(9 public + 27 authenticated). Three role-claim checks were added on 24 Aug, taking
the suite to **39**, and 39/39 pass against a local Supabase stack; on the hosted
project they need the access-token hook switched on in the dashboard first. Auth is JWKS/ES256 — verified with a real
signed-in user, not inferred. Confirmed working:

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

On the web side, Playwright covers login/register, the shops list and the
shop-detail tabs, with checked-in reference screenshots in `apps/web/e2e/`.

## Recent decisions worth knowing

- **Prisma owns `public.*` (22 Aug).** `supabase start` no longer creates tables
  and `[db.seed]` is disabled, because the old mirrored-migration setup
  FK-violated on `shops_owner_id_fkey` and pruned the container. See `AGENTS.md`.
- **The dashboard is offline-first, not just an admin panel.** IndexedDB (`idb`)
  holds inventory, a queued-sales store and a barcode→product cache, so the POS
  panel keeps selling with no signal and flushes through
  `POST /v1/shops/{id}/sales/batch` — the same idempotent path the Flutter till uses.
- **Light is the default theme, not the OS preference.** Server render and
  first-time visitors get light; the OS is only followed once the user picks
  "Auto". Shopkeepers use these phones outdoors.
- **Shop creation is a three-step wizard** with an OpenStreetMap/Nominatim
  address search picking the coordinates — typing lat/lng was losing people.
- **Tabs are URL state.** Shop detail reads its tab from the query string, so a
  refresh, the back button and a shared link all land in the same place.
- **The web client follows the contract, not the other way round.** The uploads
  presign call was fixed to match `openapi.yaml` rather than widening the spec.

## Decided, and where the rest live

The two questions that blocked client code are answered. The fee model is now
**R18 base + R6 per extra shop + R3.50/km, courier take 75%**, and
`SHOPS_TOO_FAR_APART` fires beyond **1.5 km**. The old numbers paid a courier
R9.20 for a half-hour round trip on foot, which is below minimum wage and is a
large part of why courier supply "does not exist as a pool". Reasoning and the
worked examples are in `docs/API_CONTRACT.md` § 9 and issue #34.

Everything still open is in the tracker, grouped into six milestones. The one
remaining pilot blocker is **#22** (the till cannot price an item without a
network) — **#21**, nobody who signs up being able to become a shop owner or a
courier, is what this branch fixes.

## Known rough edges

- `apps/api` has no `prisma:migrate` / `prisma:seed` / `db:setup` npm scripts,
  though older docs referenced them. Use `npx prisma …` directly, or add them.
- Root `npm run supabase:types` writes to `packages/types/supabase.ts`, and
  `packages/types` does not exist yet.
- `apps/web` has no `.env.example`; the fallbacks in `src/lib/api/client.ts` and
  `src/lib/auth/auth-service.ts` point at local Supabase and `localhost:3000/v1`.
