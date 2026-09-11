# SmartKasi — state of play

**Audited:** Thu 11 Sep 2026 · **Branch:** `feat/courier-onboarding` (clean, 1 commit ahead of `main`, no PR)
**Method:** live probes against the deployed API, plus a read of the code paths each claim depends on.
Supersedes the "tonight" framing in [`BUILD_ORDER.md`](./BUILD_ORDER.md), which still reads as if the
Sat 22 Aug deadline is the horizon.

---

## 0. The headline: the hosted stack is down

`wndilblmkkdyzpffmwap.supabase.co` **does not resolve** (NXDOMAIN). The Supabase project is paused or
deleted. The Railway container is still up and answering; its database and its JWKS issuer are gone.

```
GET /v1/health  → 200  {"status":"degraded"}   # select 1 fails
GET /v1/shops   → 500  INTERNAL_ERROR
GET /v1/me      → 401                          # no token can be verified — JWKS host unreachable
GET /v1/courier/me → 404                       # route not deployed, see §3
```

Last commit 26 Aug; free-tier projects pause after ~7 days idle. Everything downstream — three Flutter
apps, the web dashboard, every smoke script — is non-functional until this is restored. No demo
survives its first screen.

---

## 1. Ranked work, in order

### 1 · Restore the hosted Supabase project — blocks everything else
Unpause in the dashboard, or create a new project and re-point. Then, in order:

1. `npx prisma migrate deploy` (init + `20260824000001_role_claim_sync`)
2. `supabase/migrations/20260822000001_storage.sql`
3. `npm run db:users` → `npm run db:seed`
4. **Re-enable `custom_access_token_hook`** — Dashboard → Authentication → Hooks. Without it a new
   signup gets the wrong role on its *first* token. See `AGENTS.md` §2b.
5. Update `SUPABASE_URL` + service-role key in Railway **and** the hardcoded defaults in
   `apps/mobile/README.md` and `smartkasi_shared/src/config.dart`.

Verify with `npm run smoke:auth -- --base <url>/v1` — 36 green. Not `smoke`: it self-signs HS256, the
JWT secret is blank by design, and the 15 authenticated checks skip silently while reporting success.

### 2 · Make this failure loud — uptime check
`/v1/health` returned **HTTP 200** for the entire outage. `degraded` is a body field nobody reads.
Return 503 when `select 1` fails (`health.controller.ts:11-27`) and point a free pinger at it. The real
failure here is not the pause — it is two weeks of nobody knowing.

### 3 · Merge `feat/courier-onboarding` — ten minutes, closes #25 (P0)
`POST /courier/application`, `GET/PATCH /courier/me`, `POST /courier/online|offline` exist, typecheck
clean, and are documented **🟢 LIVE** in `API_CONTRACT.md`. Production returns 404 for all of them.
The contract is currently lying to the client devs.

### 4 · Courier + licence verification — #26, #27 (P1)
Nothing anywhere writes `couriers.is_verified`. `delivery.service.ts:365` rejects unverified couriers,
so every applicant sits `pending` for ever and the only courier who can take a job is the seeded one —
item 3 ships half a feature without this. `AdminController` has exactly one route
(`PATCH /admin/users/:userId/role`). Same hole for shop licences: submit exists, approve does not.
Minimum viable: `PATCH /admin/couriers/:id/verify` and `PATCH /admin/shops/:id/licence`, `@Roles('admin')`.
The console UI can follow.

### 5 · Offline POS — #22 (P0), #24 (P1), #23 (P0)
The project's headline differentiator does not work offline. Full verification in §2 below.

### 6 · Quotes in process memory — #30 (P1)
A Railway restart mid-demo kills every open checkout. ~30 min to move to Postgres.

### 7 · CI and money-path tests — #32, #31 (P1)
`.github/` does not exist. `find apps/api/src -name '*.spec.ts'` → **0**. Pricing, stock decrement and
idempotent sale replay have no coverage at all.

### 8 · Web dashboard — #27, #28 (P1)
Five routes total: `auth/login`, `auth/register`, `dashboard/shops` (+`new`, `[id]`),
`dashboard/orders`, `dashboard/map`. No admin console, no inventory, no reports. This is where items 4
and 6 eventually surface for a human, but it sits behind them.

---

## 2. SK-02 verification — **not done**

Issue #22, checked line by line on `feat/courier-onboarding` @ `c6fbf63`.

| Done when | Status | Evidence |
|---|---|---|
| Inventory cached locally, scan path reads cache first | ❌ | No local catalogue exists. `pos.dart:42` calls `deps.api.barcodeLookup()` unconditionally; the only `SharedPreferences` keys in the package are `smartkasi.themeMode` and `smartkasi.offlineSales.<shopId>` (`controllers.dart:19,225`). |
| Aeroplane mode: scan 5, take cash, show change, restart, sales still queued | ⚠️ partial | Persistence works — `OfflineSaleQueue` writes JSON to `SharedPreferences` (`controllers.dart:237-241`) and survives a restart. But the scenario cannot be reached: step one is a scan, and offline the scan throws before anything enters the cart, so the cart is empty and there is no sale to queue. |
| Restoring signal flushes without anyone pressing a button (#24) | ❌ | `flush()` has exactly one caller — the `Sync` button's `onPressed` (`pos.dart:239`). `connectivity_plus: ^7.3.1` is declared in `pubspec.yaml:12` and **imported nowhere in `lib/`** — a dead dependency, presumably added for this and never wired. |
| Cache miss offline fails with a message an owner can act on | ❌ | `_lookup()` catches into `_error`, rendered by `ErrorPanel`. `states.dart:65` narrows on `ApiException`; a network drop is a raw `DioException`, so both branches fall through to `'Request failed'` + `error.toString()` — the raw Dio string the issue explicitly rules out. |

**Verdict: 0 of 4 met** (one partially, and unreachable in the scenario as written). Nothing in the last
commit touched the POS — `c6fbf63` is courier-only; the mobile files it lists are `analysis_options.yaml`
and `pubspec.lock`.

### What it would take
1. Call the delta-pull endpoint that already exists and has no caller — `GET /shops/{id}/sync` (#23).
   There is no client for it anywhere in `smartkasi_shared`. Persist the result as a barcode→product map.
2. Read cache first in `_lookup()`, fall back to the network, and refresh the cache on every hit.
3. Wire `connectivity_plus` to auto-flush on reconnect, and flush on POS mount (#24).
4. Give a cache miss its own failure: "Not in this shop's catalogue — sync when you have signal",
   distinct from a real API error.

Items 1–2 close #22 and #23 together. The backend half is genuinely well designed — the
`@@unique([shopId, clientSaleId])` idempotency key replaces an entire sync engine — but none of it
helps while the till cannot price an item without signal.

---

## 3. Contract accuracy

`API_CONTRACT.md` §2 marks five courier rows 🟢 LIVE that 404 in production. Fix that table as part of
item 3 above — client devs are told to treat it as authoritative, and right now it is not.
