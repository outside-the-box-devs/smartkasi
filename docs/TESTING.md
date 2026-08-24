# Testing the API

## 30-second check

```bash
curl http://localhost:3000/v1/health
```

- `"status":"ok"` — API and database are both up
- `"status":"degraded"` — API is up, **database is not**. Fix `DATABASE_URL` before anything else
- connection refused — the API isn't running

Then one real query, no auth needed:

```bash
curl "http://localhost:3000/v1/shops?lat=-26.238&lng=27.9083&radius_m=3000"
```

Two Soweto shops with `distance_m`. If you get an empty list, you haven't run
`npm run db:seed`.

## Before either of those: create `apps/api/.env`

```bash
cd apps/api
cp .env.example .env
```

Fill in `DATABASE_URL` and `DIRECT_URL` at minimum. Without them the API starts
but reports `degraded`, and every data endpoint 500s. Full table in
[`apps/api/README.md`](../apps/api/README.md) § Environment.

**Percent-encode the password** if it contains `@`, `/`, `:` or `#` — `@` becomes
`%40`. An unencoded `@` splits the userinfo at the wrong place and the driver
reports it as a host or auth failure, never as a bad password.

You do **not** need `psql`. `npm run db:schema`, `db:seed` and `db:sql` go
through `scripts/sql.mjs`, which uses the `pg` dependency the API already has.

## The full suite

```bash
cd apps/api
npm run smoke:auth
```

24 checks, ~2 seconds, exits non-zero on failure. Re-runnable — it generates a
fresh `client_sale_id` each run, so it never collides with itself.

Against a deployed instance:

```bash
npm run smoke:auth -- --base https://your-api.up.railway.app/v1
```

**This is the acceptance test for tomorrow.** If all 24 pass against the
deployed URL, the backend is done and you can hand the URL to the client team.

### Use `smoke:auth`, not `smoke`

`smoke` signs its own HS256 tokens from `SUPABASE_JWT_SECRET`. That is blank on
this project by design (it signs ES256), so `mint()` returns `undefined` and the
15 authenticated checks **skip**. The output reads:

```
9 passed, 0 failed, 15 skipped
```

Zero failures, so it looks green — while every check that could catch a real
regression sat out. `smoke:auth` signs the three demo users in through GoTrue and
passes their real tokens, which also exercises the JWKS verification path the API
actually uses. A self-signed token never touches it.

### It writes to the database

The suite flushes a POS batch and places a real order, so each run leaves behind
roughly one sale, one order and two stock movements, and the daily cash-up moves.
Harmless on demo data, wrong on anything you care about. To restore the exact
seeded numbers:

```bash
cd apps/api
node scripts/sql.mjs -f ../../db/reset.sql   # destructive — demo projects only
npm run db:users
npm run db:seed
```

Seeded baseline, for comparison: 56 sales, 1 order (`SK-8F3K2P`), 61 stock
movements, and exactly one low-stock item (Clover Fresh Milk, 3/6).

### What it actually proves

| Group | Checks |
|---|---|
| System | health reports the database honestly |
| Shops & geo | real distances; `radius_m` genuinely excludes (a 3085 m shop is dropped at 3 km); the trading-licence gate holds |
| Catalog | price comparison across 3 shops with avg/min/max; barcode scan returns price + stock in one call; unknown barcode is a clean 404; shop-local items stay out of comparison |
| Auth | no token → 401; a valid token resolves the profile and its shops |
| POS | mixed batch → `207` with one created and one `TOTALS_MISMATCH`; **replaying the same batch creates nothing** — the whole offline guarantee; daily cash-up; low-stock alert; sync cursor |
| Orders | quote with a visible fee breakdown; order placement; spent quote → 409; one shop accepts + one rejects → `partially_accepted` with the total recalculated; cross-shop write → 403; unlicensed shop → 422; shop queue shows first name only |
| Stubs | AI and payments are marked as stubs and don't fake success |

### No database yet? Run the public half

Nine of the checks need no authentication at all — health, geo search, radius
filtering, price comparison, barcode scan, the licence gate:

```bash
npm run smoke -- --public-only
```

That works the moment the API and the seed are up, and it is the fastest way to
confirm the database is wired correctly. It reports the other 15 as `SKIP`, which
is honest — unlike a bare `smoke` with no secret, which skips them just as
silently but doesn't say why.

### How the tokens are obtained

`smoke:auth` does this three times, once per user, and injects the results as
`OWNER_TOKEN` / `OWNER2_TOKEN` / `CUSTOMER_TOKEN`:

```bash
curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json" \
  -d '{"email":"thoko@smartkasi.test","password":"Password123!"}'
```

Read `access_token` off the response. Tokens last an hour, which is why they are
fetched per run rather than stored anywhere.

| Role | Email | UUID |
|---|---|---|
| Owner, Mama Thoko's Tuckshop | `thoko@smartkasi.test` | `11111111-0000-4000-8000-000000000001` |
| Owner, Bra Sipho Spaza | `sipho@smartkasi.test` | `11111111-0000-4000-8000-000000000002` |
| Customer (Lerato) | `customer@smartkasi.test` | `22222222-0000-4000-8000-000000000002` |

All five demo users share the password `Password123!`. The other two are
`naledi@` (owner, Kasi Fresh) and `courier@` (Thabo). If sign-in 400s, the users
don't exist yet — run `npm run db:users`.

You can still pass tokens by hand if you have them from a client:

```bash
OWNER_TOKEN=... OWNER2_TOKEN=... CUSTOMER_TOKEN=... npm run smoke
```

## Poking at it by hand

Swagger UI, driven by the real contract, with a Try-it-out button:

```
http://localhost:3000/docs
```

Click **Authorize**, paste a token, and every endpoint is callable from the
browser. This is the fastest way to show someone the API works.

Postman or Insomnia: import `packages/contract/openapi.yaml` directly. Both read
OpenAPI 3.0 natively and build the whole collection with the examples filled in.

To get a token by hand, sign a demo user in (this project signs ES256, so there
is no shared secret to sign your own with):

```bash
curl -s "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Content-Type: application/json" \
  -d '{"email":"thoko@smartkasi.test","password":"Password123!"}'
```

On a legacy HS256 project you can sign one yourself instead:

```bash
node -e "
const c=require('crypto'), s=process.env.SUPABASE_JWT_SECRET;
const b=o=>Buffer.from(JSON.stringify(o)).toString('base64url'), n=Math.floor(Date.now()/1000);
const h=b({alg:'HS256',typ:'JWT'});
const p=b({sub:'11111111-0000-4000-8000-000000000001',app_metadata:{role:'shop_owner'},iat:n,exp:n+3600});
console.log(h+'.'+p+'.'+c.createHmac('sha256',s).update(h+'.'+p).digest('base64url'));"
```

## Common failures and what they mean

| Symptom | Cause |
|---|---|
| `health` says `degraded` | `DATABASE_URL` wrong, or Supabase is asleep. Nothing else will work. |
| Every authenticated call returns `UNAUTHENTICATED` with a token that works in the Supabase dashboard | HS256 vs JWKS mismatch. Set `SUPABASE_JWT_SECRET` **or** leave it blank for JWKS — never both, never neither. |
| `/shops` returns an empty list | `db/seed.sql` hasn't been run. |
| `404` on every path | The API is served under `/v1`. Your base URL is missing it. |
| Batch replay reports `created` instead of `duplicate` | The client is regenerating `client_sale_id` on retry. That defeats the entire offline mechanism and will double-count takings. |
| `TOTALS_MISMATCH` on a real sale | `total_cents` must equal `subtotal_cents - discount_cents`, and `subtotal_cents` must equal the sum of the line items. Both are checked. |
| `Cannot find module './internal/class.ts'` | `prisma generate` hasn't run since a schema change, or `importFileExtension = ""` was removed from `prisma/schema.prisma`. |
| `npm run smoke` says "9 passed, 0 failed" | The 15 authenticated checks skipped, because `SUPABASE_JWT_SECRET` is blank and the script had nothing to sign with. Use `npm run smoke:auth`. |
| Connection fails on a password you know is right | Unencoded `@`, `/`, `:` or `#` in `DATABASE_URL`/`DIRECT_URL`. Percent-encode it. |
| `psql: command not found` | You are on a machine without the Postgres client. Nothing to install — the `db:*` scripts use `scripts/sql.mjs` instead. |
| `prisma db pull` fails with `P4002` | Expected. `profiles.id` references `auth.users` across schemas. Do not add `auth` to the datasource to silence it — see `docs/BUILD_ORDER.md` § 1. |
| Seeded numbers look wrong (stock too high, doubled sales) | The seed was applied more than once by an older copy of `db/seed.sql`, before the idempotency guard. Reset and re-seed. |

## Testing the client apps

Point them at the real API — there is no mock any more. The Prism server that
used to run on `:4010` was retired when the delivery endpoints stopped being
stubs; a mock that disagrees with the server is worse than no mock, and it had
already drifted (it accepted a `collect` body the real contract rejected).

```bash
flutter run --dart-define=SUPABASE_ANON_KEY=... \
  --dart-define=SMARTKASI_API_BASE_URL=https://api-production-5594.up.railway.app/v1
```

To exercise error paths, use real ones: an unknown barcode is a genuine `404`,
a spent quote a genuine `409`, and a second courier accepting a taken job a
genuine `DELIVERY_ALREADY_ASSIGNED`. `npm run smoke:auth` drives all three.
