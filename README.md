# SmartKasi

Hyperlocal spaza commerce for South African townships — offline-capable POS, a
shared product catalogue with cross-shop price comparison, multi-shop
marketplace orders, and courier delivery.

## Overview

A spaza shop is a small, usually informal, neighbourhood shop. SmartKasi puts
three groups on one backend:

- **Shop owners** get a till that keeps selling with no signal, barcode-driven
  inventory, and incoming orders from customers who are not in the shop.
- **Customers** get price comparison across every shop within walking distance,
  a basket that can span several shops, and delivery.
- **Couriers** get a job board, a pickup run across the shops in one order, and
  a payout fixed at the moment delivery is requested.

The pieces that look like plumbing are the product. Money is integer cents
everywhere. Offline safety is one unique constraint, not a sync engine. Stock is
an append-only ledger, not a counter. Each of those is explained under
[The 90-second version](#the-90-second-version) and, at length, in
[`docs/ERD.md`](docs/ERD.md).

The backend shipped on 22 Aug 2026. There is no mock server any more — the Prism
stub on `:4010` was retired once courier dispatch became real, so a failure
against the API is a real failure.

## Design

| Resource | Where |
|---|---|
| Design tokens (source of truth) | [`packages/theme/src/tokens.json`](packages/theme/src/tokens.json) — consumed by web through Astryx and by Flutter through the generated `smartkasi_theme.dart` |
| API contract | [`packages/contract/openapi.yaml`](packages/contract/openapi.yaml) — hand-written, frozen, 43 paths |
| Live API | `https://api-production-5594.up.railway.app/v1` |
| Interactive API docs | `https://api-production-5594.up.railway.app/docs` (Swagger UI — **root, not under `/v1`**) |
| Figma | Not recorded anywhere in this repository. If a file exists, add the link here. |

## Tech stack

Versions below come from the manifests, not from memory.

| Area | Tool | Notes |
|---|---|---|
| Monorepo | npm workspaces + Turborepo 2.10 | `apps/*` and `packages/*`. Node `>=22.13.0`, npm `>=11.0.0` (`engines`). |
| API | NestJS 11, TypeScript 5.7 | Global auth guard, global validation pipe, one error envelope. |
| ORM | Prisma 7.9 + `@prisma/adapter-pg` | Owns every `public.*` object. 16 models, 11 enums. |
| Database | Postgres 17 (Supabase) | The local stack pins `major_version = 17` in `supabase/config.toml`. |
| Auth | Supabase GoTrue | This project signs **ES256**; the API verifies against JWKS. |
| Storage | Cloudflare R2 (presigned) + Supabase storage buckets | `POST /v1/uploads/presign` is the only thing that reads the R2 keys. |
| Web | Next.js 16.3, React 19.2, TanStack Query 5, Zustand, `idb` | App Router, React Compiler on, offline POS in IndexedDB. |
| Web UI kit | Astryx 0.4 (`@astryxdesign/core`) | Component-first; the design-system rules live in `CLAUDE.md`. |
| Mobile | Flutter, Dart SDK `^3.11.5`, Dio, `supabase_flutter`, `mobile_scanner` | Three apps, one shared package. |
| Contract lint | Redocly CLI | `npm run contract:lint`. |
| CI | GitHub Actions | `.github/workflows/ci.yml` — three jobs, free on a public repo. |

## Repository layout

```
apps/
  api/                      NestJS + Prisma. Every live endpoint.
    prisma/schema.prisma    Source of truth for public.* — read AGENTS.md first.
    prisma/migrations/      20260822000001_init, 20260824000001_role_claim_sync.
    prisma/seed.ts          Runs db/seed.sql; wired to `prisma db seed`.
    scripts/                seed-users.mjs, smoke.mjs, smoke-tokens.mjs, sql.mjs.
    src/modules/            health me shops catalog search inventory sync sales
                            orders flyers uploads admin delivery stubs.
  web/                      Next.js 16 owner dashboard + offline POS. Port 3001.
  mobile/
    customer_app/           Flutter shell — browse, compare, order, track.
    shop_owner_app/         Flutter shell — POS, inventory, order legs.
    delivery_app/           Flutter shell — courier job board and handover.
    packages/smartkasi_shared/   Every screen, model and API call all three use.
packages/
  contract/openapi.yaml     The frozen contract. Additive changes only.
  theme/                    @smartkasi/theme — tokens.json, plus CSS, TS and Dart output.
db/
  schema.sql                Generated reference copy of the Prisma migrations.
  seed.sql                  3 Soweto shops, 12 catalogue products, sales, one live order.
  reset.sql                 Empties demo data so the seed can be re-applied. Destructive.
  patches/                  Idempotent deltas for an already-populated database.
supabase/
  config.toml               Local stack: API 54321, DB 54322, Studio 54323, mail 54324.
  migrations/               storage.buckets + policies ONLY. Never a public.* table.
  seed.sql                  One-line placeholder; [db.seed] is disabled on purpose.
docs/                       API_CONTRACT, ERD, TESTING, BUILD_ORDER, STATE_OF_PLAY.
.github/workflows/ci.yml    api + contract + mobile.
```

There is no `packages/types`. The root `supabase:types` script writes to
`packages/types/supabase.ts`, which does not exist — the script has never been
run successfully and nothing imports its output.

## Roles

`profiles.role` is the authority. It reaches a client as the
`app_metadata.role` claim, injected by `custom_access_token_hook` when GoTrue
mints the token. The API authorises on the claim and nothing else.

| Capability | customer | shop_owner | courier | admin |
|---|:--:|:--:|:--:|:--:|
| Browse shops, compare prices, barcode lookup | yes | yes | yes | yes |
| Quote and place a multi-shop order | yes | yes | yes | yes |
| Track own delivery (no coordinates, ever) | yes | — | — | — |
| Create/edit a shop, submit a trading licence | — | yes | — | — |
| Inventory, POS sales, offline batch, daily report | — | yes | — | — |
| Accept / reject / ready an order leg | — | yes | — | — |
| Apply to be a courier | yes | yes | — | — |
| Courier job board, collect, hand over | — | — | yes | — |
| Change another user's role | — | — | — | yes |
| Verify a courier, decide a trading licence | — | — | — | yes — **pending merge**, see below |

Elevation is never self-service. A signup body carrying
`data: {"role":"admin"}` still lands as `customer`, and there is a smoke check
that proves it.

## Getting started

### Prerequisites

| Requirement | Why |
|---|---|
| Node `>=22.13.0`, npm `>=11.0.0` | `engines` in the root `package.json`. |
| Docker Desktop | Only for the local Supabase stack. Skip it if you point at the hosted project. |
| Flutter with Dart SDK `^3.11.5` | Mobile only. |
| A Supabase project | Hosted (`wndilblmkkdyzpffmwap`) or the local stack. |

You do **not** need `psql`. `db:schema`, `db:seed` and `db:sql` go through
`apps/api/scripts/sql.mjs`, which uses the `pg` dependency the API already has.

### Clone to running, in order

```bash
git clone git@github.com:outside-the-box-devs/smartkasi.git
cd smartkasi
npm install                      # workspaces: apps/* and packages/*

# 1. Local Supabase — auth and storage only. It creates NO public.* tables.
npm run supabase:start

# 2. API environment
cd apps/api
cp .env.example .env             # DATABASE_URL, DIRECT_URL, SUPABASE_URL at minimum

# 3. Schema. Prisma owns it — this is the only way tables get created.
npx prisma migrate deploy
npx prisma generate

# 4. Users BEFORE data. shops FK to profiles, and profiles are trigger-created
#    from auth.users, so the GoTrue users have to exist first.
npm run db:users

# 5. Demo data. Idempotent.
npx prisma db seed

# 6. Run everything
cd ../..
npm run dev                      # api on :3000, web on :3001
```

Step 4 before step 5 is not a style preference. Getting it the wrong way round
is what FK-violated `shops_owner_id_fkey` and pruned the local database
container on 22 Aug 2026; the whole of [`AGENTS.md`](AGENTS.md) § 2 exists
because of it.

Check it worked:

```bash
curl http://localhost:3000/v1/health
curl "http://localhost:3000/v1/shops?lat=-26.238&lng=27.9083&radius_m=3000"
```

`"status":"degraded"` means the API is up and Postgres is not — fix
`DATABASE_URL` before looking at anything else. An empty shops list means the
seed did not run.

### Demo accounts

Created by `apps/api/scripts/seed-users.mjs` with fixed UUIDs. Password for all
six is `Password123!`.

| Email | Role | Notes |
|---|---|---|
| `thoko@smartkasi.test` | shop_owner | Owns Mama Thoko's Tuckshop. |
| `sipho@smartkasi.test` | shop_owner | Owns the second Soweto shop. |
| `naledi@smartkasi.test` | shop_owner | Owns the third, which is advertising-only. |
| `customer@smartkasi.test` | customer | Lerato. |
| `courier@smartkasi.test` | courier | Thabo — bicycle, verified, the only courier who can take a job on seeded data. |
| `admin@smartkasi.test` | admin | The only account that can change a role. |

These are demo credentials for demo data, not secrets.

### Environment variables

`apps/api` — the full list with the reasoning is in
[`apps/api/.env.example`](apps/api/.env.example). The ones that matter to boot:

| Variable | Required | Notes |
|---|:--:|---|
| `DATABASE_URL` | yes | Transaction pooler, port **6543**. What the API connects with. |
| `DIRECT_URL` | yes | Session pooler, port **5432**. Prisma CLI and `sql.mjs` only. |
| `SUPABASE_URL` | yes | Also where the JWKS is fetched from. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server only. Never ship to a client. |
| `SUPABASE_JWT_SECRET` | no | **Leave blank on this project.** See `apps/api/README.md`. |
| `R2_*` | no | Uploads. Only `/v1/uploads/presign` reads them. |
| `FEE_*`, `MAX_BASKET_SPREAD_M` | no | Quote maths; defaults in `src/config/configuration.ts`. |

`apps/web` — three variables, and there is no `.env.example` in the repo yet:
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
All three are `NEXT_PUBLIC_`, which means **Next inlines them at build time** and
setting them on a running deployment does nothing without a rebuild. Unset, they
fall back to localhost silently. See [`apps/web/README.md`](apps/web/README.md).

`apps/mobile` — no `.env`; overrides are `--dart-define` flags with defaults in
`apps/mobile/packages/smartkasi_shared/lib/src/config.dart`.

## Running the checks

There is CI now (`.github/workflows/ci.yml`), which was not true before this
branch. It runs on every push to `main` and every pull request:

| Job | Runs |
|---|---|
| `api` | `prisma generate`, `npm run check-types`, `npm run lint:check`, `npm test` |
| `contract` | `npm run contract:lint` (Redocly) |
| `mobile` | `flutter pub get`, `flutter analyze`, `flutter test` across `smartkasi_shared` and all three apps |

No job touches a database. `prisma generate` is required because the client is
generated into `apps/api/src/generated` and is not committed.

Make `contract` a required status check in the branch protection rules for
`main`. Without that the workflow reports but does not gate.

Locally:

```bash
npm run check-types                    # tsc across the workspace
npm run build                          # api + web
npm run contract:lint                  # the frozen OpenAPI contract

cd apps/api
npm run lint:check                     # eslint, read-only
npm test                               # 38 unit tests, 3 suites, no database
npm run smoke:auth                     # 47 end-to-end checks against a running API

cd ../web && npx playwright test       # 10 tests, 2 specs, against localhost:3001

cd ../mobile/packages/smartkasi_shared && flutter analyze && flutter test
```

Two traps that have cost people time:

- **`npm run lint` is `eslint --fix`.** It rewrites your working tree and still
  exits non-zero. Use `lint:check` in `apps/api`; the root `npm run lint` fans
  out through Turbo and reaches the `--fix` variant. `CONTRIBUTING.md` § 4.
- **`npm run smoke` without `:auth` proves much less than it looks like.** It
  self-signs HS256 tokens from `SUPABASE_JWT_SECRET`, which is blank here, so
  the 38 authenticated checks skip and it still prints a green summary. It also
  **writes** to whatever database it points at — a run adds a sale, an order and
  two stock movements. Demo projects only. Restore with
  `node scripts/sql.mjs -f ../../db/reset.sql && npm run db:users && npm run db:seed`.

## Deployment

Two platforms are involved and the relationship between them is not fully
resolved. That is stated here rather than smoothed over.

### Railway — this is what serves production

Project `profound-communication`, two services:

| Service | What | Notes |
|---|---|---|
| `api` | NestJS | `https://api-production-5594.up.railway.app/v1`. Swagger UI at `/docs`; raw spec at `/docs-json` and `/docs-yaml`. All three sit at the **root** — `/v1/docs` is a 404, because `setGlobalPrefix` applies to controllers and `SwaggerModule.setup('docs', …)` does not go through it. |
| `web` | Next.js | Binds `process.env.PORT`. `apps/web`'s `start` script was `next start -p 3001` and is now plain `next start` so Railway can assign the port; the service has a public domain. |

Railway environment variables override the defaults in
`apps/api/src/config/configuration.ts`. Changing a fee constant in code does
nothing on its own — see `CONTRIBUTING.md` § 7.

### Vercel — unresolved

Two projects exist: `smartkasi` under `lethabo-maepas-projects`, and
`smartkasi-api` under `nhlakanipho-masilelas-projects`. They are wired through
the Vercel GitHub App, so there is **no `vercel.json` or any other Vercel config
in this repository** — `.vercel/` is local and gitignored.

Whether they are live, stale, or duplicates of the Railway services is not
established. Nothing in the code points at a Vercel URL: every reference in the
repository, including the Flutter default base URL and the `servers` block in
`openapi.yaml`, points at Railway. Treat Railway as production until somebody
checks the Vercel dashboards and writes the answer down here.

### Supabase

Project ref `wndilblmkkdyzpffmwap`, region `aws-1-eu-west-1`. Auth signs
**ES256**, so `SUPABASE_JWT_SECRET` stays blank and the API verifies against
`$SUPABASE_URL/auth/v1/.well-known/jwks.json`.

The custom access token hook must be switched on — locally in
`supabase/config.toml` `[auth.hook.custom_access_token]`, on the hosted project
in Dashboard → Authentication → Hooks. Turn it off and every new signup silently
becomes a permanent `customer`, and no file in this repository will tell you.

### Production is ahead of `main`

**Verified by probe on 12 Sep 2026.** The deployed API serves 47 paths. `main`
and this branch have 43. The extra four — `GET /admin/couriers`,
`PATCH /admin/couriers/{courierId}/verify`, `GET /admin/shops`,
`PATCH /admin/shops/{shopId}/licence` — come from `feat/admin-verification`,
which is pushed to origin, has one commit, and **has not been merged**.

They are genuinely running, not merely present in the served spec:
`GET /v1/admin/couriers` answers `401` while `GET /v1/admin/nonexistent` answers
`404`, so the routes are registered and the guard is what rejects.

This is the second time production has run an unmerged branch —
`docs/STATE_OF_PLAY.md` § 1 recorded the same shape for `feat/courier-onboarding`
on 11 Sep. The hazard is the same: the next deploy from `main` silently removes
endpoints the deployed contract advertises as live. Merge the branch or stop
deploying from it.

Until it is merged, read anything in these READMEs marked **pending merge** as
"in the repository and in production, but not on `main`".

## The 90-second version

**Money is integer cents.** Every field ends `_cents`. `1850` is R18.50.

**Auth is Supabase.** The API issues no tokens and has no `/login`. Clients sign
in with the Supabase SDK and send the access token.

**Prisma owns the database; Supabase owns auth and storage.** One source of
truth for `public.*`: `apps/api/prisma/schema.prisma`. `supabase/migrations/`
may only ever contain `storage.*` objects. Putting a table in the wrong place is
what destroyed the local database on 22 Aug — [`AGENTS.md`](AGENTS.md) § 2.

**Offline is one unique constraint.** The till generates `client_sale_id` at the
moment of sale and keeps it. `@@unique([shopId, clientSaleId])` means a replayed
batch produces one sale. There is no sync engine on the server and there should
not be one.

**Stock is a ledger**, not a counter. `stock_movements` is append-only and
`shop_products.stock_qty` is a trigger-maintained projection. Never write the
projection.

**Sales go through even when stock would go negative.** A shop that sold its
last tin while offline has sold it. Negative stock is a signal to count, not an
error for the cashier.

**One global product catalogue keyed on barcode.** Price comparison across shops
is impossible if each shop owns its own product list.

**No PostGIS.** Prisma cannot read a `geography` column, so coordinates are
plain doubles, with a bounding box in SQL and an exact haversine pass in Node.
The haversine pass is not optional — it is what correctly drops a shop 3085 m
away from a 3 km search. The cost is documented in `docs/ERD.md` § 5.

**One token file, two platforms.** `packages/theme/src/tokens.json` is the
source. Do not hardcode a colour in either app.

**Courier position is never sent to a customer.** No coordinates, no route, no
ETA more precise than a band. A live route in a township tells anyone holding
the phone where a person carrying cash will be, and when. See
`docs/API_CONTRACT.md` § Route privacy — and do not add a moving pin "just for
the demo".

## Where the rest of the documentation lives

This file links rather than duplicates. Each of these is the authority on its
own subject.

| Document | What it is for |
|---|---|
| [`AGENTS.md`](AGENTS.md) | The database contract. **Read before touching `db/`, `supabase/` or `apps/api/prisma/`.** Who owns which schema, the migration procedure, and the state that is not in git. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Branch names, the verification commands, commit and PR format. Note that its opening line ("There is no CI") predates `.github/workflows/ci.yml`. |
| [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) | Prose guide to the API — conventions, auth, the LIVE/STUB table, the fee model (§ 9), route privacy. Read once before the spec. |
| [`docs/ERD.md`](docs/ERD.md) | The data model and why each table looks the way it does. |
| [`docs/TESTING.md`](docs/TESTING.md) | How to run the smoke suite and what each check proves. Its check counts are stale — count the `check` / `checkAuth` / `checkRole` calls in `apps/api/scripts/smoke.mjs`. |
| [`docs/BUILD_ORDER.md`](docs/BUILD_ORDER.md) | What was cut and why, written against the 22 Aug deadline. Historical. |
| [`docs/STATE_OF_PLAY.md`](docs/STATE_OF_PLAY.md) | Audit of 11 Sep 2026 — ranked work, live probe results, where the API docs live. The most current status document. |
| [`apps/api/README.md`](apps/api/README.md) | Backend setup, the ES256/JWKS decision, migrations, known limitations. |
| [`apps/web/README.md`](apps/web/README.md) | Dashboard setup, the build-time env-var trap, the offline POS. |
| [`apps/mobile/README.md`](apps/mobile/README.md) | The three Flutter apps and the shared package. |
| [`supabase/README.md`](supabase/README.md) | What Supabase owns locally, and why it owns so little. |

## Licence

Private. `apps/api/package.json` declares `UNLICENSED`; no licence is granted.
