# SmartKasi — state of play

**Audited:** Fri 11 Sep 2026 · **Branch:** `feat/courier-onboarding` (clean, 1 commit ahead of `main`, no PR)
**Method:** live probes against the deployed API, plus a read of the code paths each claim depends on.
Supersedes the "tonight" framing in [`BUILD_ORDER.md`](./BUILD_ORDER.md), which still reads as if the
Sat 22 Aug deadline is the horizon.

---

## 0. Correction — the stack is UP

An earlier revision of this file said the hosted stack was dead. **That was wrong and is withdrawn.**

`wndilblmkkdyzpffmwap.supabase.co` returns NXDOMAIN **from this machine's corporate resolver only**
(10.205.79.225). Via 8.8.8.8 and 1.1.1.1 it resolves normally, and probing the project directly
through it:

```
GET /auth/v1/health                 -> responds (asks for an apikey)
GET /auth/v1/.well-known/jwks.json  -> 200
```

The Supabase project is alive. A local NXDOMAIN is a DNS question, not a verdict on the project —
check a second resolver before concluding anything.

What *was* real, observed ~13:00 SAST:

```
GET /v1/health      -> 200 {"status":"degraded"}   # select 1 failing
GET /v1/shops       -> 500 INTERNAL_ERROR
GET /v1/courier/me  -> 404                          # probed twice
```

At 13:47 the same three return `{"status":"ok"}`, `200`, and `401`. The database blip was genuine and
cleared itself — most likely a cold pooler connection or an instance restart, not a paused project.
Cause unconfirmed; worth one look at the Railway deploy log for that window.

**The 404 -> 401 flip is the part that matters.** Production now serves the courier routes, so the
running build is `feat/courier-onboarding`, not `main`. The deployed `/docs-json` has 43 paths
including `/courier/application`; `main`'s spec has 40 and none of them. **Production is running code
that is not on the default branch and has never been through a PR.**

---

## 1. Ranked work, in order

### 1 · Merge `feat/courier-onboarding` — production is ahead of `main`
The deployed API serves `/courier/application`, `/courier/me` and `/courier/online|offline`; `main`
has none of them. The next deploy from `main` silently removes five endpoints that `API_CONTRACT.md`
marks LIVE and that production is already answering. One commit, typechecks clean, closes #25.

### 2 · Make a database failure loud
`/v1/health` returned **HTTP 200** throughout the outage — `degraded` is a body field nobody reads,
and nothing alerted. Return 503 when `select 1` fails (`health.controller.ts:11-27`) and point a free
pinger at it. The blip cleared on its own this time; the next one might not, and nobody would know.

### 3 · Courier + licence verification — #26, #27 (P1)
Nothing anywhere writes `couriers.is_verified`. `delivery.service.ts:365` rejects unverified couriers,
so every applicant sits `pending` for ever and the seeded Thabo is the only courier who can work —
item 1 ships half a feature without this. `AdminController` has exactly one route
(`PATCH /admin/users/:userId/role`). Same hole for shop licences: submit exists, approve does not.
Minimum viable: `PATCH /admin/couriers/:id/verify` and `PATCH /admin/shops/:id/licence`, `@Roles('admin')`.

### 4 · Offline POS — #22 (P0), #24 (P1), #23 (P0)
The headline differentiator does not work offline. Full verification in §2.

### 5 · Quotes in process memory — #30 (P1)
A restart mid-demo kills every open checkout. ~30 min to move to Postgres. The instance restart
that appears to have happened today is exactly this failure mode, unobserved.

### 6 · CI and money-path tests — #32, #31 (P1)
`.github/` does not exist. `find apps/api/src -name '*.spec.ts'` -> **0**. Pricing, stock decrement and
idempotent sale replay have no coverage outside the smoke suite.

### 7 · Web dashboard — #27, #28 (P1)
Five routes: `auth/login`, `auth/register`, `dashboard/shops` (+`new`, `[id]`), `dashboard/orders`,
`dashboard/map`. No admin console, no inventory, no reports. Where items 3 and 5 eventually surface
for a human, but behind them.

---

## 2. SK-02 verification — **not done**

Issue #22, checked line by line on `feat/courier-onboarding` @ `c6fbf63`.

| Done when | Status | Evidence |
|---|---|---|
| Inventory cached locally, scan path reads cache first | NO | No local catalogue exists. The only `SharedPreferences` keys in the package are `smartkasi.themeMode` and `smartkasi.offlineSales.<shopId>` (`controllers.dart:19,225`). `pos.dart:42` calls `deps.api.barcodeLookup()` unconditionally. |
| Aeroplane mode: scan 5, take cash, show change, restart, sales still queued | PARTIAL | Persistence works — `OfflineSaleQueue` writes JSON to `SharedPreferences` (`controllers.dart:237-241`) and survives a restart. The scenario is unreachable: step one is a scan, which throws offline, so the cart stays empty and there is no sale to queue. |
| Restoring signal flushes without a button (#24) | NO | `flush()` has one caller — the Sync button's `onPressed` (`pos.dart:239`). `connectivity_plus: ^7.3.1` is in `pubspec.yaml:12` and **imported nowhere in `lib/`**. |
| Cache miss offline fails with a message an owner can act on | NO | `ErrorPanel` narrows on `ApiException` (`ui/common/states.dart:65`); a network drop is a raw `DioException`, so it renders `'Request failed'` + `error.toString()` — the raw Dio string the issue rules out. |

**Verdict: 0 of 4 met**, one partially and unreachable as written. Nothing in `c6fbf63` touched the
POS — its mobile files are `analysis_options.yaml` and `pubspec.lock`.

### What it would take
1. Call `GET /shops/{id}/sync`, which exists and has no caller anywhere in `smartkasi_shared` (#23).
   Persist the result as a barcode -> product map.
2. Read cache first in `_lookup()`, fall back to the network, refresh the cache on every hit.
3. Wire `connectivity_plus` to auto-flush on reconnect, and flush on POS mount (#24).
4. Give a cache miss its own failure: "Not in this shop's catalogue — sync when you have signal".

Items 1-2 close #22 and #23 together.

---

## 3. Where the API documentation lives

| Source | Where | Notes |
|---|---|---|
| Interactive docs | `https://api-production-5594.up.railway.app/docs` | Swagger UI. Served from the YAML at runtime, so it works even when the database is down. |
| Raw spec, JSON | `.../docs-json` | What tooling and codegen should consume. |
| Raw spec, YAML | `.../docs-yaml` | |
| Local | `http://localhost:3000/docs` | `cd apps/api && npm run dev`. |
| Source of truth | `packages/contract/openapi.yaml` | 2,959 lines, 43 paths, hand-written. Lint with `npm run contract:lint`. |
| Prose guide | `docs/API_CONTRACT.md` | Conventions, auth, LIVE/STUB table, known gaps. Read once before the spec. |
| Data model | `docs/ERD.md` | |

Note `/docs` sits at the root, **not** under `/v1` — `/v1/docs` is a 404.

`main.ts:76` reads the YAML off disk and hands it to `SwaggerModule`; there are no `@ApiProperty`
decorators anywhere. Spec-first, deliberately: the contract was frozen for client devs before the
backend was finished.

**Path-level drift check, run 11 Sep: 43 routes in code, 43 paths in spec, zero difference either
way.** That covers paths only, not field shapes. Worth adding to CI (#32) next to `contract:lint`.

There is **no codegen** — no `openapi-generator`, `orval` or `openapi-typescript` in any manifest. The
43 endpoints are hand-written three times: the spec (2,959 lines), Flutter `api.dart` + models (1,308),
and web `src/lib/api/*.ts` (570).
