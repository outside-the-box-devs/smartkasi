# SmartKasi API

NestJS 11 + Prisma 7. Implements [`packages/contract/openapi.yaml`](../../packages/contract/openapi.yaml).

Contract first: if the code and the spec disagree, the spec is right and the
code is the bug.

## Run it

```bash
cp .env.example .env          # DATABASE_URL + DIRECT_URL + SUPABASE_URL at minimum
npm install                   # from the repo root — this is an npm workspace
npx prisma migrate deploy     # creates tables, views, triggers, RLS
npx prisma generate           # or: npm run prisma:generate
npm run db:users              # the six demo users, via the Supabase Admin API
npx prisma db seed            # applies ../../db/seed.sql (demo data), idempotent
npm run start:dev             # or: npm run dev — same thing
```

- API: `http://localhost:3000/v1`
- Contract docs (Swagger UI, served from the real `openapi.yaml`): `http://localhost:3000/docs`
- Health: `http://localhost:3000/v1/health` — `"degraded"` means the DB is unreachable

`/docs` sits at the **root**, not under the prefix. `setGlobalPrefix` applies to
controllers; `SwaggerModule.setup('docs', …)` does not go through it, so
`/v1/docs` is a 404 both locally and on Railway. `/docs-json` and `/docs-yaml`
are alongside it.

**Prisma owns the schema.** `prisma migrate deploy` is the way tables get
created; `npm run db:schema` still exists and still applies `../../db/schema.sql`,
but that file is a *generated reference copy* of the migrations. Use it only for
tooling that wants one flat SQL file — never as the way you migrate. See
[`AGENTS.md`](../../AGENTS.md) before you touch any of this.

There are no `prisma:migrate`, `prisma:seed` or `db:setup` npm scripts on this
package — call `npx prisma …` directly. (Older docs, including earlier revisions
of this file and `supabase/README.md`, reference `npm run db:setup`. It has never
existed.) `prisma.config.ts` wires `db seed` to `ts-node prisma/seed.ts` and
points the CLI at `DIRECT_URL`.

`db:schema`, `db:seed` and `db:sql` go through `scripts/sql.mjs` rather than `psql`,
so a machine without the Postgres client (most Windows dev boxes) can still
apply the SQL. It connects on `DIRECT_URL` — the 6543 pooler cannot run DDL or
the seed's `do $$ … $$` block.

`db:users` creates the six demo users through GoTrue with the UUIDs
`db/seed.sql` expects. It must run **before** the seed: shops FK to `profiles`,
and `profiles` rows are trigger-created from `auth.users`. The seed's own
`insert into auth.users` block is commented out, because a hand-written row
leaves GoTrue's token columns NULL and signs in once before failing on refresh.

If the database password contains `@`, `/`, `:` or `#`, percent-encode it in both
URLs (`@` becomes `%40`). An unencoded `@` splits the userinfo in the wrong place
and the driver reports it as a host or authentication failure.

## Scripts on this package

Every script below is in `package.json`; nothing here is aspirational.

| Script | What it does |
|---|---|
| `dev` / `start:dev` | `nest start --watch` |
| `start` / `start:prod` | `nest start` / `node dist/main` |
| `build` | `nest build` |
| `check-types` | `tsc --noEmit` |
| `lint:check` | `eslint "src/**/*.ts"` — **read-only. Use this one.** |
| `lint` | `eslint … --fix`. **Rewrites your working tree** and still exits non-zero. |
| `test`, `test:watch`, `test:cov` | Jest unit tests. No database. |
| `smoke` | `scripts/smoke.mjs` — self-signs HS256 tokens. Not useful on this project; see below. |
| `smoke:auth` | `scripts/smoke-tokens.mjs` — signs demo users in through GoTrue, then runs `smoke.mjs`. |
| `db:users` | `scripts/seed-users.mjs` — the six demo users via the GoTrue Admin API. |
| `db:schema`, `db:seed`, `db:sql` | `scripts/sql.mjs` against `DIRECT_URL`. |
| `prisma:generate`, `prisma:pull` | `prisma generate` / `prisma db pull` (inspection only). |
| `contract:lint` | Redocly against `../../packages/contract/openapi.yaml`. |
| `format` | Prettier over `src/**/*.ts`. |

There is no `test:e2e`. It was removed along with `apps/api/test/`, which was
Nest scaffold asserting `GET /` returns `'Hello World!'` — a route this API does
not have. The integration suite is `smoke:auth`.

## Environment

`cp .env.example .env` and fill in. Only the first four matter to boot; the rest
have working defaults in `src/config/configuration.ts`.

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Transaction pooler, **6543**. What the API connects with. |
| `DIRECT_URL` | Session pooler, **5432**. Prisma CLI and `scripts/sql.mjs` only — 6543 cannot run introspection, DDL, or the seed's `do $$ … $$` block. |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co`. Also where the JWKS is fetched from. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Never ship to a client. |
| `SUPABASE_JWT_SECRET` | **Blank on this project** — see below. |
| `R2_*` | Uploads. `/v1/uploads/presign` is the only thing that reads them. |
| `FEE_*`, `MAX_BASKET_SPREAD_M` | Quote maths. **Decided** (issue #34): R18 base, R6 per extra shop, R3.50/km, courier take 75%, basket spread 1.5 km. |
| `PORT`, `API_PREFIX` | Default `3000` and `v1`. Railway sets `PORT`. |

Percent-encode the password in both URLs if it contains `@`, `/`, `:` or `#`
(`@` becomes `%40`). An unencoded `@` splits the userinfo at the wrong place, and
the driver reports it as a host or authentication failure — never as a bad
password, which is what makes it cost an hour.

Railway environment variables override these defaults. Changing a fee constant
in `configuration.ts` does nothing to production on its own.

### HS256 vs JWKS — decide before you write any client code

The API verifies Supabase tokens two ways and picks by whether
`SUPABASE_JWT_SECRET` is set. Set exactly one; **never both, never neither.**

| Project | Signs with | Do this |
|---|---|---|
| Legacy | HS256, shared secret | Put the secret in `SUPABASE_JWT_SECRET` |
| Current | ES256/RS256, rotating keys | Leave `SUPABASE_JWT_SECRET` **blank** — the guard fetches `$SUPABASE_URL/auth/v1/.well-known/jwks.json` |

Getting it wrong makes every request return `UNAUTHENTICATED` while the exact
same token works in the Supabase dashboard — the two are verifying against
different keys, so the symptom points nowhere near the cause.

Ask the project rather than guessing:

```bash
curl -s "$SUPABASE_URL/auth/v1/.well-known/jwks.json"
```

A key with `"alg":"ES256"` (or `RS256`) means asymmetric — leave the secret
blank. An empty `keys` array means legacy HS256 — set it.

**This project returns `ES256`, so `SUPABASE_JWT_SECRET` is blank and the JWKS
path is live.** Verified end to end: a signed-in demo user gets an ES256 token,
`GET /v1/me` returns `200` with the right role, and refresh returns `200`.

## Test it

### Unit tests — no database, no network

```bash
npm test            # 38 tests, 3 suites, under a second
```

| Suite | Covers |
|---|---|
| `src/modules/orders/fee-math.spec.ts` | The service fee and the courier/platform split. |
| `src/modules/orders/order-math.spec.ts` | The order state machine over its legs, and the recomputed total. |
| `src/common/time.spec.ts` | Africa/Johannesburg day bucketing and Postgres `time` handling. |

`fee-math.ts` and `order-math.ts` are pure functions extracted out of
`QuoteService`, `DeliveryService` and `OrdersService.recomputeOrder` for exactly
this reason: they decide what a customer is charged, what a courier is paid, and
what status three client apps display, and none of that should need a Prisma
context to assert. The worked examples the fee tests pin come from
`docs/API_CONTRACT.md` § 9.1 — if the code and § 9.1 disagree, § 9.1 wins,
because the numbers are a commercial decision.

These are what CI runs. They are not a substitute for the smoke suite; they do
not touch a controller, a guard, or a query.

### Smoke suite — end to end against a running API

```bash
npm run smoke:auth                                   # all 47, real tokens
npm run smoke:auth -- --base https://your-api.com/v1 # against a deployment
npm run smoke -- --public-only                       # the 9 that need no token
```

**47 checks** on `main` and on this branch — 9 public, 30 authenticated, and 8
role-claim/courier-onboarding checks that additionally need
`SUPABASE_SERVICE_ROLE_KEY` (and `DIRECT_URL` for a few). Exits non-zero on
failure.

Count them yourself rather than trusting a number in prose — every previously
written count in this repository was wrong and they disagreed with each other:

```bash
grep -cE 'await (check|checkAuth|checkRole)\(' scripts/smoke.mjs
```

`docs/TESTING.md` says 36 and `CONTRIBUTING.md` says "36+"; both predate the
courier-onboarding checks. On the unmerged `feat/admin-verification` branch the
same command returns 52, because that branch adds a `checkLicence` helper and
five more checks.

Use `smoke:auth`, not `smoke`, on this project. Plain `smoke` self-signs HS256
tokens from `SUPABASE_JWT_SECRET`; that secret is blank here because the project
signs ES256, so `mint()` returns `undefined` and the 38 authenticated checks
quietly skip — you get "9 passed" and no failures, which reads like success.
`smoke:auth` signs five demo users in through GoTrue (`thoko`, `sipho`,
`customer`, `courier`, `admin`) and passes their real tokens, which also
exercises the JWKS path and the access-token hook that a self-signed token never
touches.

**The suite writes to the database it runs against.** It flushes a POS batch and
places a real order, so a run adds ~1 sale, 1 order and 2 stock movements, and
the daily cash-up reflects them. That is fine on demo data and wrong on anything
you care about. To get back to exactly the seeded numbers:

```bash
node scripts/sql.mjs -f ../../db/reset.sql   # destructive — demo projects only
npm run db:users
npm run db:seed
```

### CI

`.github/workflows/ci.yml` runs the `api` job on every push to `main` and every
pull request: `prisma generate` (with a placeholder `DATABASE_URL`, because the
generated client is not committed and nothing opens a connection), then
`check-types`, `lint:check`, and `npm test`.

The smoke suite is deliberately **not** in CI. It writes to whatever database it
points at, and that is not a thing to run from a workflow against a shared
project.

## Verified working

Run against a seeded Postgres, not just written:

- Supabase JWT verification (HS256 shared secret **and** JWKS), role guard, `@Public()` opt-out
- Shop geo-search with real distances, and a radius that actually excludes
  (a shop 3085 m away is correctly dropped at `radius_m=3000`)
- Barcode lookup returning shop price + stock in one round trip
- Cross-shop price comparison with avg/min/max; shop-local items correctly excluded
- Offline sales batch: replaying the same batch produces **one** sale row and two ledger entries
- Mixed batch → `207` with per-sale `created` / `duplicate` / `failed`
- Daily report bucketed by the Africa/Johannesburg day
- Quote → order → shop A accepts, shop B rejects → `partially_accepted`, total recalculated
- Shop B accepting shop A's leg → `403`; spent quote → `409`; advertising-only shop → `422`
- Courier dispatch end to end: request → job board → accept → collect → handover,
  order lands on `completed`, and a second courier's accept loses the race with a `409`
- Role claims: an Admin-API courier's **first** token says `courier`; changing
  `profiles.role` reaches the next token with no refresh; and a self-service
  signup sending `data: {"role":"admin"}` still comes back as `customer`
- Courier onboarding: a customer applies and lands `pending` + offline, the role
  follows on the next token, an unverified courier may go online and still gets
  `422` from the board, an offline verified one likewise — and switching mode
  from bicycle to vehicle drops the verification a human gave to a bicycle

## Layout

```
prisma/schema.prisma       16 models, 11 enums — the source of truth for public.*
prisma/migrations/         20260822000001_init, 20260824000001_role_claim_sync
prisma/seed.ts             Applies ../../db/seed.sql; wired to `prisma db seed`
scripts/                   seed-users.mjs, smoke.mjs, smoke-tokens.mjs, sql.mjs
src/
  main.ts                  bootstrap, global pipes/filters, /docs from the contract
  app.module.ts            wiring; the auth guard is global (opt out with @Public())
  prisma.service.ts        PrismaClient + @prisma/adapter-pg
  config/configuration.ts  typed env, including the fee constants
  common/
    geo.ts                 haversine + bounding box
    time.ts                Africa/Johannesburg bucketing, Postgres `time` handling
    errors/api-error.ts    ApiErrorCode enum — mirrors the contract
    filters/               the single error envelope
    guards/                Supabase JWT + roles
  modules/
    health me shops catalog search inventory sync sales orders flyers uploads
    orders/fee-math.ts     pure: service fee and courier split
    orders/order-math.ts   pure: order status from its legs, and the total
    admin/                 role management — PATCH /admin/users/{userId}/role
    delivery/              REAL — onboarding, dispatch, courier job board, collect, handover
    stubs/                 ai, payments only — two controllers, fixed responses
```

`stubs/` really is only those two: `ai.controller.ts` and
`payments.controller.ts`. Everything else that was ever in it has left.

`delivery/` left `stubs/` on 22 Aug. It owns `POST /v1/orders/{id}/delivery`,
`GET /v1/deliveries/{id}` and the courier job board
(`GET /v1/courier/jobs`, `accept`, `collect`, `deliver`), backed by real rows and
real state transitions. The Prism mock was retired in the same change — there is
no second API to point a client at any more.

It also owns the supply side (#25): `POST /v1/courier/application`,
`GET`/`PATCH /v1/courier/me`, `POST /v1/courier/online` and `/offline`. Those
live in a **second controller** on the same prefix, `CourierProfileController`,
with no class-level `@Roles('courier')` — applying cannot require the role you
are applying for, and the role a successful application grants only reaches the
caller on their next token. They authorise on the `couriers` row instead and
only ever touch the caller's own record. `CourierController` keeps its role gate
because its responses carry customer addresses and phone numbers.

### Courier and licence verification — pending merge

`AdminController` on `main` and on this branch has exactly one route:
`PATCH /admin/users/{userId}/role`.

The branch `feat/admin-verification` (one commit, pushed to origin, **not
merged**) adds four more: `GET /admin/couriers`,
`PATCH /admin/couriers/{courierId}/verify`, `GET /admin/shops` and
`PATCH /admin/shops/{shopId}/licence`. It is what finally writes
`couriers.is_verified` and moves a shop's `licence_status`.

**That branch is deployed.** Probed 12 Sep 2026: the Railway API serves 47 spec
paths against 43 in this tree, and `GET /v1/admin/couriers` answers `401` where
`GET /v1/admin/nonexistent` answers `404` — the routes are registered and it is
the guard rejecting. So production is running code that is not on `main` and has
not been through a PR, for the second time this month (see
`docs/STATE_OF_PLAY.md` § 1). Anything below marked *pending merge* means
"in the repository and in production, but not on `main`".

Until it merges, on a checkout of `main`: nothing sets `is_verified`, an
applicant stays `pending` for ever, and the seeded Thabo is the only courier who
can work.

## Decisions you should not undo without reading this

**No PostGIS.** Prisma cannot read a `geography` column — it introspects as
`Unsupported(...)` and is unreadable through the typed client. So coordinates
are plain `Float` lat/lng, and distance is a bounding-box query in Postgres
(which uses the `(lat, lng)` index) followed by an exact haversine pass in
`common/geo.ts`. The bounding box over-selects the corners of the square, which
is why the haversine pass is not optional — it is what correctly drops that
3085 m shop from a 3 km search.

The cost is real: no GIST index, and `shops.list` / `search.products` page in
memory. At tens or hundreds of shops that is free. Past a few thousand, those
two queries move back to raw SQL with PostGIS.

**Auth is on by default.** The global guard authenticates every route; opt out
with `@Public()`. The inverse — opt *in* to auth — is how endpoints ship
unprotected.

**The role claim is built in the database, not here.** The guard reads
`app_metadata.role` and trusts it. `profiles.role` is the authority behind that
claim, and two database objects connect them (migration
`20260824000001_role_claim_sync`):

- `t_profiles_role_to_auth` mirrors `profiles.role` into
  `auth.users.raw_app_meta_data`, for RLS and direct-to-Supabase clients.
- `custom_access_token_hook(jsonb)` is called by GoTrue at mint time and injects
  the live `profiles.role` into every token.

Both are needed. The trigger alone cannot fix signup: GoTrue builds the first
access token from its in-memory user struct inside the signup transaction, so a
trigger firing afterwards leaves the new user on `customer` until they refresh.
**The hook is a manual switch on the hosted project** — Dashboard →
Authentication → Hooks → Custom Access Token. Turn it off and every fresh signup
silently becomes a permanent customer again, which is exactly the bug this
replaced. The `Role claims` smoke checks exist to make that loud.

Do not read a role out of `raw_user_meta_data`. That is the client-supplied
signup body; anyone could register as an admin.

**Stock is a ledger.** `stock_movements` is append-only; `shop_products.stockQty`
is a projection maintained by a database trigger. Never write `stockQty`
directly — create a movement. This is what makes replaying a week of offline
sales safe, and why "why is my stock wrong?" is a query rather than a mystery.

**Sales go through even when stock would go negative.** A spaza that sold its
last tin while offline has sold it. Refusing the write loses real money for a
tidy number. Negative stock is a signal for the owner to count, not an error for
the cashier.

**Idempotency is one unique constraint.** `@@unique([shopId, clientSaleId])`,
plus a `P2002` catch for the concurrent-flush race. No sync engine, no vector
clock, no merge algorithm — every extra mechanism here is a new way to lose a
day's takings.

**`CustomerDelivery` must never grow coordinates, a route, or a courier phone
number.** See `docs/API_CONTRACT.md` § Route privacy. Safety constraint, not a
preference.

## Three build gotchas already fixed here

Each would have cost you an evening.

1. **`prisma.config.ts` was breaking `start:prod`.** With it inside the
   compilation root, `tsc` shifted the output to `dist/src/main.js` while
   `start:prod` still ran `node dist/main`. It is now excluded in
   `tsconfig.build.json`.

   That exclusion was incomplete: `prisma/seed.ts` was still inside the
   compilation root, so the output stayed at `dist/src/main.js` and
   `start:prod` still could not find it. `prisma` and `scripts` are now
   excluded too, and `nest build` emits `dist/main.js` as the script expects.

2. **Prisma 7 emits `.ts` extensions in its generated relative imports.** Under
   `moduleResolution: "nodenext"` tsc leaves them verbatim and the built app dies
   on `require('./internal/class.ts')`. Fixed with `importFileExtension = ""` on
   the generator block. The alternative is `rewriteRelativeImportExtensions` in
   `tsconfig.json`; the generator option was chosen so your tsconfig stays as it was.

3. **ESLint was linting the generated Prisma client.** `src/generated/**` is not
   committed and is regenerated on every install and in CI, so any formatting
   fix there is erased on the next run — and Prisma's codegen whitespace moves
   between patch releases, which showed up as a stale local copy passing while a
   fresh one in CI failed on 24 files over a leading newline. It is in the
   `ignores` block in `eslint.config.mjs`.

Also note `main.ts` installs a `BigInt.prototype.toJSON` polyfill. Prisma maps
Postgres `bigint` to JS `BigInt` and `JSON.stringify` throws on it, so every
response carrying a `_cents` field would 500 without it. Presenters still convert
with `Number()` explicitly; the polyfill is the safety net. `main.ts` also
downgrades `unhandledRejection` from "print and exit" to "log at error level",
because the rejections this process actually sees come from Prisma retiring a
transaction on a connection Supabase already closed — raised from a timer, after
the request that triggered it was already answered. Exiting on that drops every
other in-flight request to report an error nobody is waiting for.

## Known limitations

Reviewed against the code on 12 Sep 2026. Several entries here were fixed since
the first version of this table and are marked so, because a stale limitation is
worse than no table.

| Thing | Status | Impact | Fix |
|---|---|---|---|
| Quotes held in memory (`QuoteService`) | Open | Lost on restart; breaks with >1 instance. Symptom is a spurious `QUOTE_EXPIRED`, which clients already handle. | A `quotes` table or Redis. |
| `sync.deleted_shop_product_ids` always `[]` | Open | An offline till keeps showing items the owner deleted. | Add `deleted_at` to `shop_products`, soft-delete, return tombstones. |
| `low_stock` filter and geo paging happen in memory | Open | Prisma cannot compare two columns, or sort by a computed distance. | Raw SQL if either list ever gets large. |
| No rate limiting | Open | Fine behind a demo; not fine in public. | `@nestjs/throttler`, 5 minutes. |
| No structured request logging | Open | `request_id` is generated but not logged with the request line. | Pino + an interceptor. |
| `/v1/health` returns HTTP 200 while degraded | Open | The database outage on 11 Sep returned `200 {"status":"degraded"}` throughout, and nothing alerted. | Return 503 when `select 1` fails (`health.controller.ts`), and point a pinger at it. `docs/STATE_OF_PLAY.md` § 1.2. |
| Courier verification is manual SQL | **Fixed, pending merge** | Was: every applicant sat `pending` for ever. | `PATCH /admin/couriers/{courierId}/verify` on `feat/admin-verification`. Deployed; not on `main`. |
| Licence verification is manual SQL | **Fixed, pending merge** | Was: nobody could flip a shop to `verified` from a UI. The seed ships two pre-verified shops. | `PATCH /admin/shops/{shopId}/licence` on `feat/admin-verification`. Deployed; not on `main`. |
| No unit tests | **Fixed** | Was: `smoke:auth` was the entire regression suite, and it needs a live database. | 38 tests over the fee maths, the order state machine, and SAST time bucketing. `npm test`. |
| No CI | **Fixed** | Was: nothing ran on push, so a frozen contract three client apps build against was enforced by memory. Issue #32. | `.github/workflows/ci.yml`. Still needs `contract` set as a required status check on `main`. |
| `npm run lint` unusable | **Partly fixed** | `lint` is still `--fix` and still rewrites the tree. | `lint:check` is the read-only sibling and is what CI runs. The formatting-churn commit that would make `lint` itself safe is still owed (#32). |

## Migrations

`prisma/schema.prisma` is the source of truth for `public.*` — 16 models,
11 enums, indexes. Two migrations exist:

| Migration | Size | Holds |
|---|---|---|
| `20260822000001_init/migration.sql` | 25,872 bytes | The full initial schema — extensions (`uuid-ossp`, `pg_trgm`), enums, tables, views, check constraints, triggers and the RLS policies Prisma cannot express. |
| `20260824000001_role_claim_sync/migration.sql` | 11,344 bytes | Raw SQL only, no model change: `handle_new_auth_user()`, `t_profiles_role_to_auth`, `t_auth_role_to_profile`, `custom_access_token_hook`. |

`../../db/schema.sql` is a **reference copy** for tooling that expects a single
flat SQL file. It is not byte-identical to any one migration — it is the whole
schema including the role-claim delta, hand-mirrored. Do not edit it as source.

**Supabase** owns **only** Supabase-managed schemas. Storage buckets live in
`supabase/migrations/20260822000001_storage.sql` and are applied by
`supabase db reset` to the local Postgres on port 54322. `supabase/config.toml`
has `[db.seed] enabled = false` — DB demo data is **not** seeded through
`supabase/seed.sql` (now a one-line placeholder), which is what stops
`supabase start` from FK-violating on `shops_owner_id_fkey` the way it did on
22 Aug 2026 (the seed inserted shops before `profiles` existed; profiles are
trigger-created from `auth.users`).

The full workflow:

```bash
# A. DB change (Prisma)
#    edit prisma/schema.prisma
npx prisma migrate dev --name add_<feature>
#    review the generated migration.sql; paste in raw SQL for triggers/RLS/views
npx prisma generate
#    then hand-mirror the same statements into ../../db/schema.sql.
#    That file is a full create-from-nothing script — copying a delta over it
#    truncates it down to the delta.

# B. Storage/auth change (Supabase)
npx supabase migration new add_<storage_feature>   # storage/auth objects ONLY
#    edit supabase/migrations/<ts>_add_<storage_feature>.sql
npx supabase db reset

# C. Seed (two-phase: GoTrue, then Prisma)
npx prisma migrate deploy && npm run db:users && npx prisma db seed
```

Never create `public.*` tables via `supabase migration new`, and never hand-edit
`db/schema.sql` as source — see [`AGENTS.md`](../../AGENTS.md) § 3 and
[`supabase/README.md`](../../supabase/README.md). The hosted project
`wndilblmkkdyzpffmwap` was populated over `DIRECT_URL` with
`prisma migrate deploy`, not `supabase db push`, so its `supabase_migrations`
table is empty for the DB; `migration repair` is only needed for the storage
migrations. `npx prisma db pull` is inspection-only.

## Minting a test token locally

**This project signs asymmetrically (ES256), so `SUPABASE_JWT_SECRET` is blank
and the API verifies against the JWKS endpoint.** The HS256 recipe below does
not apply here — sign a demo user in and use the token GoTrue hands back:

```bash
curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json" \
  -d '{"email":"thoko@smartkasi.test","password":"Password123!"}'
```

That user is the seeded owner of Mama Thoko's Tuckshop. The other five are
`sipho@`, `naledi@`, `customer@`, `courier@` and `admin@smartkasi.test`, same
password. `admin@` is the only one that can call
`PATCH /v1/admin/users/{userId}/role`, which is how someone becomes a shop owner
or a courier.

On a *legacy* project that signs HS256, set `SUPABASE_JWT_SECRET` and sign your
own instead:

```bash
node -e "
const c=require('crypto'), s=process.env.SUPABASE_JWT_SECRET;
const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url'), n=Math.floor(Date.now()/1000);
const h=b({alg:'HS256',typ:'JWT'});
const p=b({sub:'11111111-0000-4000-8000-000000000001',app_metadata:{role:'shop_owner'},iat:n,exp:n+3600});
console.log(h+'.'+p+'.'+c.createHmac('sha256',s).update(h+'.'+p).digest('base64url'));"
```

## Changing the contract

1. Edit `packages/contract/openapi.yaml`
2. `npm run contract:lint` from the repo root — must pass. CI runs this too.
3. Announce in the team channel **before** changing code. Three Flutter apps and
   the dashboard are built against this file.

Additive changes (new optional field, new endpoint) need no announcement.
Removing or renaming a field, or changing a status code, does.

There is no codegen anywhere on this project — no `openapi-generator`, `orval`
or `openapi-typescript` in any manifest. The 43 endpoints are hand-written three
times: the spec, the Flutter client, and the web client. A path-level drift
check on 11 Sep found 43 routes in code against 43 paths in the spec, zero
difference either way. That covers paths only, not field shapes.
