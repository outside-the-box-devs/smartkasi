# Build order for tonight

**Deadline: Sat 22 Aug, 10:00 SAST.**

## Read this first

The scope in the project brief — POS with offline sync, barcode inventory,
multi-shop cart, geo price comparison, delivery dispatch, AI dish→ingredients —
is not a backend you write overnight. What is in `apps/api/` covers the LIVE half
of the contract and has been run against a seeded database. The work tonight is
**wiring it to your real Supabase project and proving it**, not writing it again.

If you find yourself writing new features tonight, you are on the wrong path.
The failure mode for this deadline is not "too few endpoints". It is "the backend
exists but nobody could point a client app at it by 10 a.m."

## Order

### 1 · Supabase project — ✅ DONE

Project `wndilblmkkdyzpffmwap`, `aws-1-eu-west-1`, linked to this repo.

- [x] Project created.
- [x] `db/schema.sql` applied. Verified in place: 16 tables, 11 enums, 8 triggers,
      10 RLS policies, `uuid-ossp` + `pg_trgm`. No PostGIS, as intended.
- [x] `db/seed.sql` applied. The `auth.users` block is now **commented out** in
      the file; the five users are created by `npm run db:users`, which calls the
      Admin API with the exact UUIDs the seed expects. Hand-writing that table
      leaves GoTrue's token columns `NULL` — the row signs in once and then fails
      on refresh, which is the "behaves oddly" this checklist warned about.
- [x] Auth → Providers: email enabled, Google off.
- [x] `apps/api/.env` filled in — both pooler URLs, `SUPABASE_URL`,
      service-role key.
- [x] `npx prisma init` never run. All 16 models intact.
- [x] **HS256 vs JWKS: decided — JWKS.** The project's JWKS endpoint returns an
      `ES256` key, so it signs asymmetrically and `SUPABASE_JWT_SECRET` stays
      blank. Verified end to end, not inferred: a signed-in demo user gets an
      ES256 token, `GET /v1/me` returns `200` with the right role and shop, and
      refresh returns `200`. Details in `apps/api/README.md` § Environment.
- [x] Prisma schema confirmed against the live database — 16 models, 11 enums,
      every column matching. `importFileExtension = ""` intact; the generated
      client emits no `.ts` import extensions.

**Checkpoint:** ✅ `GET /v1/health` → `{"status":"ok"}`.

#### Three traps this step actually hit

1. **The password wasn't URL-encoded.** It contains `@`, which splits the
   userinfo at the wrong place. Percent-encode it (`@` → `%40`) in *both* URLs.
2. **`psql` isn't installed**, so `npm run db:schema` / `db:seed` could not run
   at all. They now go through `scripts/sql.mjs`, which uses the `pg` dependency
   the API already has. No Postgres client needed.
3. **`npx prisma db pull` fails with `P4002`** on this database, because
   `profiles.id` references `auth.users` across schemas. Adding `auth` to the
   datasource `schemas` would drag 17 GoTrue models into the schema file. The
   check was done instead by introspecting to a throwaway file and diffing table
   and column names — same guarantee, nothing to clean up afterwards. **Do not
   "fix" this by re-running `db pull` into `prisma/schema.prisma`.**

Also note: `supabase db execute` is not a real command. The CLI subcommand is
`supabase db query --file`, and for this repo `npm run db:sql` is easier.

### 2 · Prove the LIVE endpoints against real data — ✅ DONE

```bash
cd apps/api
npm run smoke:auth
```

**Checkpoint:** ✅ all 24 pass against the real Supabase project.

Use `smoke:auth`, not `smoke`. Plain `smoke` self-signs HS256 tokens from
`SUPABASE_JWT_SECRET`; that is blank here by design, so `mint()` returns
`undefined` and the 15 authenticated checks **quietly skip**. You get
"9 passed, 0 failed", which reads exactly like success. `smoke:auth` signs the
three demo users in through GoTrue and passes their real tokens — which also
exercises the JWKS path the API actually uses, something a self-signed token
never touches.

**The suite writes to the database it runs against** — it flushes a POS batch and
places a real order. Fine on demo data, wrong on anything else. To restore the
exact seeded numbers:

```bash
node scripts/sql.mjs -f ../../db/reset.sql   # destructive — demo projects only
npm run db:users
npm run db:seed
```

### 3 · Deploy somewhere the phones can reach (45 min)

`localhost` is not a demo. Welcome's phone cannot reach your laptop.

**Railway.** `railway.json` at the repo root already carries the build and start
commands, the health check and the replica count, so there is nothing to type
into the dashboard except environment variables.

```json
"buildCommand": "npm ci && npm run build --workspace api"
"startCommand": "npm run start:prod --workspace api"
```

**Leave Root Directory blank — do not set it to `apps/api`.** This is an npm
workspace: the lockfile is at the repo root, and `main.ts` loads the contract
from `../../packages/contract/openapi.yaml` relative to the working directory.
Point Railway at `apps/api` and you get an install without the root lockfile and
a silent loss of `/docs`. Both commands above were run from the repo root and
verified — health `ok`, `/docs` 200.

Set these variables (from `apps/api/.env.example`):

| Variable | Value |
|---|---|
| `DATABASE_URL` | The 6543 transaction pooler. **The only database URL the runtime reads.** Percent-encode the password. |
| `SUPABASE_URL` | `https://<ref>.supabase.co` — also the JWKS origin |
| `SUPABASE_SERVICE_ROLE_KEY` | server only |
| `SUPABASE_JWT_SECRET` | **leave unset** — this project signs ES256 |
| `NODE_ENV` | `production` |
| `API_PREFIX` | `v1` |
| `R2_*`, `FEE_*`, `MAX_BASKET_SPREAD_M` | from `.env.example` |

Do **not** set `PORT`; Railway injects it and `main.ts` already reads it and
binds `0.0.0.0`. `DIRECT_URL` is Prisma-CLI-only and not needed at runtime.

**Keep it at one replica.** `QuoteService` holds quotes in a `Map` in process
memory (`orders/quote.service.ts:50`). Two replicas means a customer can be
quoted by one instance and check out against another, which returns
`QUOTE_EXPIRED` for no visible reason. This is also why serverless — Vercel,
Lambda — is the wrong target for this API until quotes live in Postgres.

**Checkpoint:** `npm run smoke:auth -- --base https://<your-url>/v1` — all 24
green against the deployed instance. (Plain `smoke` would report 9 passed and
skip the rest, which looks green enough to deploy on.) Then
`curl https://<your-url>/v1/health` from your phone on mobile data.

One gap to know about: the Railway health check passes whenever the process
answers, because `/health` returns **200 even when `status` is `degraded`** —
that is what `packages/contract/openapi.yaml` specifies, and the contract wins.
A deploy with an unreachable database will look healthy on the Railway
dashboard. Read the `status` field, don't trust the green dot.

Post the URL in the team channel the moment it works — that unblocks the Flutter
and Next.js work more than any endpoint does.

### 4 · Hand over (15 min)

Post in the channel:

- The base URL (with `/v1`)
- A link to `docs/API_CONTRACT.md`
- The LIVE/STUB table, pasted inline so nobody has to open a file
- Answers to the two open questions (fee constants, max basket spread)

### 5 · Only if time remains, in this order

1. **Structured logging** with `request_id` on the request line — 20 min, and it
   turns every "it doesn't work" message on Sunday into a two-minute answer.
2. **Quotes in Postgres** instead of memory — 30 min, removes a
   restart-kills-checkout failure mode during the demo.
3. **Rate limiting** (`@nestjs/throttler`) — 5 min.
4. **Soft deletes + real sync tombstones** — 30 min.

## What to drop, and say out loud that you dropped it

- **Delivery.** Stubbed. The courier supply side does not exist as a pool in the
  township — that is a business problem, not a sprint. Demo collection.
- **AI dish→ingredients.** Stubbed. The shape is right; wiring a model tonight
  buys one slide and costs three hours.
- **Payments.** Cash only. Already the stated plan.
- **Realtime.** Poll at 20 s. Nobody in the room will notice.
- **Admin licence verification.** The seed ships two pre-verified shops.

## The failure modes, ranked

1. ~~**Supabase isn't set up at 2 a.m.**~~ — **retired.** Step 1 is done and the
   health check is green. The remaining database risk is someone running
   `db/reset.sql` or the smoke suite against something that is not demo data.
2. **The backend only runs on your laptop** at 10 a.m., so nobody can integrate.
   Step 3 matters more than any feature.
3. **Welcome built against endpoints that don't exist.** The LIVE/STUB table
   prevents this — only if he has read it. Confirm that in the channel, by name.
4. ~~**JWT verification mode is wrong**~~ — **retired.** JWKS, verified against
   a real token. The live version of this risk is now the inverse: someone sets
   `SUPABASE_JWT_SECRET` to "fix" an auth problem, which silently switches the
   guard to HS256 and breaks every real Supabase token at once.
5. **Someone adds a live courier map to the customer app for the demo.** Say now
   that this is off the table, and why.

## One honest note on the timeline

Backend Sat 10:00, three Flutter apps Sun 22:00, Next.js dashboard Mon 15:00 —
with the same three people on the backend and the dashboard. The Flutter deadline
is the one that will slip, because Welcome is building three apps alone and
cannot start integrating until step 3 above is done.

The highest-leverage thing you can do tonight is not another endpoint. It is
getting a reachable URL into the channel early enough that he has Saturday, not
Saturday night.
