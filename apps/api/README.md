# SmartKasi API

NestJS + Prisma. Implements [`packages/contract/openapi.yaml`](../../packages/contract/openapi.yaml).

Contract first: if the code and the spec disagree, the spec is right and the
code is the bug.

## Run it

```bash
cp .env.example .env          # DATABASE_URL + DIRECT_URL + SUPABASE_URL at minimum
npm install                   # from the repo root — this is an npm workspace
npx prisma migrate deploy     # creates tables, views, triggers, RLS
npm run db:users              # the five demo users, via the Supabase Admin API
npx prisma db seed            # applies ../../db/seed.sql (demo data), idempotent
npm run prisma:generate
npm run start:dev
```

- API: `http://localhost:3000/v1`
- Contract docs (Swagger UI, served from the real `openapi.yaml`): `http://localhost:3000/docs`
- Health: `http://localhost:3000/v1/health` — `"degraded"` means the DB is unreachable

**Prisma owns the schema now.** `prisma migrate deploy` is the way tables get
created; `npm run db:schema` still exists and still applies `../../db/schema.sql`,
but that file is a *generated reference copy* of the initial migration. Use it
only for tooling that wants one flat SQL file — never as the way you migrate.
See [`AGENTS.md`](../../AGENTS.md) before you touch any of this.

There are no `prisma:migrate`, `prisma:seed` or `db:setup` npm scripts on this
package — call `npx prisma …` directly. `prisma.config.ts` wires `db seed` to
`ts-node prisma/seed.ts` and points the CLI at `DIRECT_URL`.

`db:schema`, `db:seed` and `db:sql` go through `scripts/sql.mjs` rather than `psql`,
so a machine without the Postgres client (most Windows dev boxes) can still
apply the SQL. It connects on `DIRECT_URL` — the 6543 pooler cannot run DDL or
the seed's `do $ ... $` block.

`db:users` creates the five demo users through GoTrue with the UUIDs
`db/seed.sql` expects. It must run **before** the seed: shops FK to `profiles`,
and `profiles` rows are trigger-created from `auth.users`. The seed's own
`insert into auth.users` block is commented out, because a hand-written row
leaves GoTrue's token columns NULL and signs in once before failing on refresh.

If the database password contains `@`, `/`, `:` or `#`, percent-encode it in both
URLs (`@` becomes `%40`). An unencoded `@` splits the userinfo in the wrong place
and the driver reports it as a host or authentication failure.

## Environment

`cp .env.example .env` and fill in. Only the first four matter to boot; the rest
have working defaults.

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Transaction pooler, **6543**. What the API connects with. |
| `DIRECT_URL` | Session pooler, **5432**. Prisma CLI and `scripts/sql.mjs` only — 6543 cannot run introspection, DDL, or the seed's `do $$ … $$` block. |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co`. Also where the JWKS is fetched from. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Never ship to a client. |
| `SUPABASE_JWT_SECRET` | **Blank on this project** — see below. |
| `R2_*` | Uploads. `/v1/uploads/presign` is the only thing that reads them. |
| `FEE_*`, `MAX_BASKET_SPREAD_M` | Quote maths. Placeholders — open question 1 in `docs/API_CONTRACT.md`. |

Percent-encode the password in both URLs if it contains `@`, `/`, `:` or `#`
(`@` becomes `%40`). An unencoded `@` splits the userinfo at the wrong place, and
the driver reports it as a host or authentication failure — never as a bad
password, which is what makes it cost an hour.

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

```bash
npm run smoke:auth                                   # all 39, real tokens
npm run smoke:auth -- --base https://your-api.com/v1 # against a deployment
npm run smoke -- --public-only                       # the 9 that need no token
```

39 checks — 9 public, 30 authenticated — exits non-zero on failure. See
[`docs/TESTING.md`](../../docs/TESTING.md).

Use `smoke:auth`, not `smoke`, on this project. Plain `smoke` self-signs HS256
tokens from `SUPABASE_JWT_SECRET`; that secret is blank here because the project
signs ES256, so `mint()` returns `undefined` and the 30 authenticated checks
quietly skip — you get "9 passed" and no failures, which reads like success.
`smoke:auth` signs four demo users in through GoTrue (`thoko`, `sipho`,
`customer`, `courier`) and passes their real tokens, which also exercises the
JWKS path a self-signed token never touches.

**The suite writes to the database it runs against.** It flushes a POS batch and
places a real order, so a run adds ~1 sale, 1 order and 2 stock movements, and
the daily cash-up reflects them. That is fine on demo data and wrong on anything
you care about. To get back to exactly the seeded numbers:

```bash
node scripts/sql.mjs -f ../../db/reset.sql   # destructive — demo projects only
npm run db:users
npm run db:seed
```

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

## Layout

```
prisma/schema.prisma       16 models mirroring db/schema.sql
src/
  main.ts                  bootstrap, global pipes/filters, /docs from the contract
  app.module.ts            wiring; the auth guard is global (opt out with @Public())
  prisma.service.ts        PrismaClient + @prisma/adapter-pg
  config/configuration.ts  typed env
  common/
    geo.ts                 haversine + bounding box
    time.ts                Africa/Johannesburg bucketing, Postgres `time` handling
    errors/api-error.ts    ApiErrorCode enum — mirrors the contract
    filters/               the single error envelope
    guards/                Supabase JWT + roles
  modules/
    health me shops catalog search inventory sync sales orders flyers uploads
    delivery/              REAL — dispatch, courier job board, collect, handover
    stubs/                 ai, payments only — fixed responses, delete when real
```

`delivery/` left `stubs/` on 22 Aug. It now owns `POST /v1/orders/{id}/delivery`,
`GET /v1/deliveries/{id}` and the courier job board
(`GET /v1/courier/jobs`, `accept`, `collect`, `deliver`), backed by real rows and
real state transitions. The Prism mock was retired in the same change — there is
no second API to point a client at any more.

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

## Two build gotchas already fixed here

Both would have cost you an evening.

1. **`prisma.config.ts` was breaking `start:prod`.** With it inside the
   compilation root, `tsc` shifted the output to `dist/src/main.js` while
   `start:prod` still ran `node dist/main`. It is now excluded in
   `tsconfig.build.json`.

2. **Prisma 7 emits `.ts` extensions in its generated relative imports.** Under
   `moduleResolution: "nodenext"` tsc leaves them verbatim and the built app dies
   on `require('./internal/class.ts')`. Fixed with `importFileExtension = ""` on
   the generator block. The alternative is `rewriteRelativeImportExtensions` in
   `tsconfig.json`; the generator option was chosen so your tsconfig stays as it was.

Also note `main.ts` installs a `BigInt.prototype.toJSON` polyfill. Prisma maps
Postgres `bigint` to JS `BigInt` and `JSON.stringify` throws on it, so every
response carrying a `_cents` field would 500 without it. Presenters still convert
with `Number()` explicitly; the polyfill is the safety net.

## Known limitations — read before Saturday

| Thing | Impact | Fix |
|---|---|---|
| Quotes held in memory (`QuoteService`) | Lost on restart; breaks with >1 instance. Symptom is a spurious `QUOTE_EXPIRED`, which clients already handle. | A `quotes` table or Redis. |
| `sync.deleted_shop_product_ids` always `[]` | An offline till keeps showing items the owner deleted. | Add `deleted_at` to `shop_products`, soft-delete, return tombstones. |
| `low_stock` filter and geo paging happen in memory | Prisma cannot compare two columns, or sort by a computed distance. | Raw SQL if either list ever gets large. |
| No rate limiting | Fine behind a demo; not fine in public. | `@nestjs/throttler`, 5 minutes. |
| Licence verification is manual SQL | Nobody can flip a shop to `verified` from a UI. The seed ships two pre-verified shops. | An admin endpoint after the demo. |
| No unit tests | `npm run smoke:auth` (24 end-to-end checks) is the regression suite. Good enough for the deadline; not a substitute afterwards. | Jest around the sale-totals and fee maths first. |
| No structured request logging | `request_id` is generated but not logged with the request line. | Pino + an interceptor. 20 minutes, worth it before the demo. |

## Migrations

`apps/api/prisma/schema.prisma:1` is the source of truth for `public.*` — 16 models, enums, indexes.
The initial migration `prisma/migrations/20260822000001_init/migration.sql:1` (25872 bytes) is a
verbatim copy of the former `db/schema.sql` and includes the triggers (`443-490`), RLS policies
(`500-552`), views (`403-439`), and check constraints that Prisma cannot express. `db/schema.sql:1`
is now a **generated reference copy** of that migration for tooling that expects a single SQL file.

**Supabase** owns **only** Supabase-managed schemas (`storage`, `auth`). Storage buckets live in
`supabase/migrations/20260822000001_storage.sql:1` and are applied by `supabase db reset` to the
local Postgres at `supabase/config.toml:35` port `54322`. `supabase/config.toml:66-71` has
`[db.seed] enabled = false` — DB demo data is NOT seeded via `supabase/seed.sql` (which is now a
1-line placeholder) to avoid the `shops_owner_id_fkey` FK violation that broke `supabase start`
on 2026-08-22 (seed tried to INSERT shops before `profiles` existed; profiles are trigger-created
from `auth.users`).

The full workflow is:

```
# A. DB change (Prisma)
edit prisma/schema.prisma  →  npx prisma migrate dev --name add_<feature>  →  review migration.sql (paste raw SQL for triggers/RLS)  →  npx prisma generate
# Then mirror the delta by hand into ../../db/schema.sql (a full create script — do NOT Copy-Item a delta over it)

# B. Storage/auth change (Supabase)
npx supabase migration new add_<storage_feature>  # storage/auth only!
# Edit supabase/migrations/<ts>_add_<storage_feature>.sql
npx supabase db reset

# C. Seed (two-phase: GoTrue + Prisma)
npx prisma migrate deploy && npm run db:users && npx prisma db seed  # or npm run db:setup
# db:users = GoTrue Admin API (5 fixed UUIDs), db seed = db/seed.sql via prisma/seed.ts (idempotent)
```

Never create `public.*` tables via `supabase migration new` and never hand-edit `db/schema.sql` as
source — see `AGENTS.md:3` mandatory workflow and `supabase/README.md:1` for the `migration repair`
needed before first `supabase db push` to `wndilblmkkdyzpffmwap` (DB still populated via
`DIRECT_URL`/`prisma migrate deploy`, not via `db push`). `npx prisma db pull` is inspection-only.

## Minting a test token locally

**This project signs asymmetrically (ES256), so `SUPABASE_JWT_SECRET` is blank
and the API verifies against the JWKS endpoint.** The HS256 recipe below does
not apply here — sign a demo user in and use the token GoTrue hands back:

```bash
curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json" \
  -d '{"email":"thoko@smartkasi.test","password":"Password123!"}'
```

That user is the seeded owner of Mama Thoko's Tuckshop. The other four are
`sipho@`, `naledi@`, `customer@` and `courier@smartkasi.test`, same password.

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
2. `npm run contract:lint` from the repo root — must pass
3. Announce in the team channel **before** changing code. Two client apps are
   built against this file.

Additive changes (new optional field, new endpoint) need no announcement.
Removing or renaming a field, or changing a status code, does.
