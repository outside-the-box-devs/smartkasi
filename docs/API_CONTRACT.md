# SmartKasi API Contract v1.0.0-rc1

**Status:** frozen for client development · **Backend live:** Sat 22 Aug 2026, 10:00 SAST
**Machine-readable spec:** [`packages/contract/openapi.yaml`](../packages/contract/openapi.yaml)
**Base URL:** `https://api-production-5594.up.railway.app/v1`

Read this document once. Read `packages/contract/openapi.yaml` for field-level truth.

---

## 1. What "frozen" means

The **shapes** in this contract will not change. Field names, types, enum
values, status codes and error codes are settled.

Permitted without notice: new optional fields, new endpoints, new enum values
appended to non-exhaustive enums (`error.code` — always handle an unknown code
gracefully).

Not permitted without a team-channel announcement and a version bump: removing
or renaming a field, changing a type, changing a status code, changing the
meaning of an enum value.

If you need a field that isn't here, ask in the channel. Do not invent it and
assume it will appear.

---

## 2. LIVE vs STUB — the only table that matters tomorrow

| Endpoint | Status | Notes for client devs |
|---|---|---|
| `GET /health` | 🟢 LIVE | |
| `GET /me` · `PATCH /me` | 🟢 LIVE | Call `GET /me` right after Supabase sign-in. |
| `GET /shops` | 🟢 LIVE | Geo search. Pass `lat`/`lng` to get `distance_m`. |
| `POST /shops` · `GET /shops/{id}` · `PATCH /shops/{id}` | 🟢 LIVE | |
| `POST /shops/{id}/licence` | 🟢 LIVE | Manual admin verification in v1. |
| `GET /products` · `POST /products` · `GET /products/{id}` | 🟢 LIVE | |
| `GET /products/barcode/{barcode}` | 🟢 LIVE | **POS hot path.** Pass `shop_id`. |
| `GET /search/products` | 🟢 LIVE | Price comparison across shops. |
| `GET/POST/PATCH /shops/{id}/inventory…` | 🟢 LIVE | |
| `POST /shops/{id}/inventory/bulk-upsert` | 🟢 LIVE | Offline flush. Returns `207`. |
| `GET /shops/{id}/inventory/low-stock` | 🟢 LIVE | Owner alert badge. |
| `GET /shops/{id}/sync` | 🟢 LIVE | Delta pull for offline POS. |
| `POST /shops/{id}/sales` · `/sales/batch` | 🟢 LIVE | Idempotent. |
| `GET /shops/{id}/sales` · `/{saleId}` · `/void` | 🟢 LIVE | |
| `GET /shops/{id}/reports/daily` | 🟢 LIVE | Cash-up screen. |
| `POST /orders/quote` | 🟢 LIVE | Call on every basket change. |
| `POST /orders` · `GET /orders` · `GET /orders/{id}` · `/cancel` | 🟢 LIVE | |
| `GET /shops/{id}/orders` | 🟢 LIVE | Shop order queue. Poll 20s. |
| `POST /orders/{id}/legs/{shopId}/accept · reject · ready` | 🟢 LIVE | |
| `GET/POST/DELETE /shops/{id}/flyers` | 🟢 LIVE | |
| `POST /uploads/presign` | 🟢 LIVE | R2 direct upload. |
| `POST /orders/{id}/delivery` | 🟢 LIVE | Idempotent on the order. Safe to double-tap. |
| `GET /deliveries/{id}` | 🟢 LIVE | Customer view. Status + ETA band only — see § Route privacy. |
| `GET /courier/jobs` + accept/collect/deliver | 🟢 LIVE | Matched from the courier's home address. `accept` races → `409`. |
| `POST /ai/dish-ingredients` | 🔴 **STUB** | Always returns pap & chakalaka. No model call. |
| `POST /payments/intent` | 🔴 **STUB** | `status: "not_implemented"`. v1 is cash. |

### Rules for STUB endpoints

- **Build the screen. Do not build the logic.** A stub's shape is contractual;
  its values are not.
- Do not write a state machine that waits for a stub status to change. It won't.
- Do not demo a flow whose payoff depends on a stub. Delivery is no longer one
  of them — request through handover is real. "Watch the courier move on a map"
  is still off the table, by design rather than by omission: see § Route privacy.
- Every stub returns HTTP `200`/`202` with valid data — you will not get an
  error telling you it's fake. Check this table.

---

## 3. Conventions

### Money
Integer cents, ZAR. Every monetary field ends `_cents`. `1850` = R18.50.

```dart
String rands(int cents) => 'R${(cents / 100).toStringAsFixed(2)}';
```

Never parse a decimal. Never send one. Floating-point money in a POS is how you
end up 3 cents short at cash-up with no way to find it.

### Time
ISO 8601, UTC, `Z` suffix. Display in `Africa/Johannesburg` (UTC+2). The API
never sends local time.

### IDs
UUID v4 strings everywhere, except `orders.order_number` (`SK-8F3K2P`, for
humans) and `quote_id` (opaque, don't parse).

### Pagination
```
GET /shops?page=1&per_page=25          # per_page max 100
```
```json
{ "data": [...], "meta": { "page": 1, "per_page": 25, "total": 87, "total_pages": 4 } }
```

### Errors
Same envelope on every non-2xx:
```json
{ "error": { "code": "INSUFFICIENT_STOCK", "message": "…", "details": [], "request_id": "req_01J8XK2M9P" } }
```
**Switch on `error.code`. Never on `error.message`** — messages get reworded and
will eventually be translated to isiZulu and Sesotho.

Include `request_id` in any bug report. It finds the log line in one grep.

Full code list is in `packages/contract/openapi.yaml` under `ErrorResponse`.

---

## 4. Authentication

**There is no `/login` in this API and there never will be.**

```
Flutter/Next.js  ──sign in──▶  Supabase Auth  ──JWT──▶  client
client  ──Authorization: Bearer <jwt>──▶  SmartKasi API  ──verify vs JWKS──▶  ✔
```

1. Client signs in with `supabase_flutter` / `@supabase/supabase-js`
   (email+password, phone OTP, or Google).
2. Client sends the access token as `Authorization: Bearer <token>`.
3. API verifies the signature, reads `sub` (user id) and
   `app_metadata.role`.

**Token refresh is 100% the client SDK's job.** On `401` with code
`TOKEN_EXPIRED`: refresh via the SDK, retry the request **once**, then bounce to
the login screen. Do not build a refresh loop against this API.

### Demo accounts

Seeded and live on the shared Supabase project. Sign in with the Supabase SDK as
normal — these are ordinary email/password users, nothing special about them.

| Email | Role | Sees |
|---|---|---|
| `thoko@smartkasi.test` | shop_owner | Mama Thoko's Tuckshop — full mode, verified licence, the week of POS sales |
| `sipho@smartkasi.test` | shop_owner | Bra Sipho Spaza — full mode, verified, one out-of-stock item |
| `naledi@smartkasi.test` | shop_owner | Kasi Fresh Mini Market — **advertising_only, no licence**, use this to exercise the 422 gate |
| `customer@smartkasi.test` | customer | Lerato, with a home address in Orlando East and one live order |
| `courier@smartkasi.test` | courier | Thabo, bicycle, online and verified |

Password for all five: `Password123!`

They are demo data on a demo project. Do not reuse these addresses, and do not
carry the password into anything real.


### Roles

| Role | Can |
|---|---|
| `customer` | Browse, search, order, track own orders |
| `shop_owner` | Everything for shops they own, plus staff management |
| `shop_staff` | Sell, sync; inventory and voids only if flagged |
| `courier` | Courier job endpoints. LIVE since the delivery work landed |
| `admin` | Everything, incl. licence verification |

Endpoints marked `security: []` in the spec are public — shop directory,
product catalog, search, flyers. The customer app can render its browse
experience before sign-in.

---

## 5. Offline POS protocol — read this properly

This is the part most likely to be got wrong, so it is spelled out.

**The server has no sync engine.** It has an idempotent write and a delta read.
Everything else about offline is the Flutter app's local queue.

### Push: `POST /shops/{shopId}/sales/batch`

```
1. Cashier completes a sale, device is offline
   └─ generate client_sale_id = uuid.v4()      ← ONCE, at sale time
   └─ write sale to local SQLite with synced = false

2. Connectivity returns
   └─ POST up to 200 unsynced sales in one call

3. Read the per-sale results array:
      status = "created"    → mark synced. Done.
      status = "duplicate"  → mark synced. THIS IS SUCCESS, not an error.
      status = "failed"     → leave queued, surface to the owner. Do not retry blindly.
```

Non-negotiables:

- `client_sale_id` is generated **once** and persisted. Regenerating it on retry
  defeats the entire mechanism and will double-count takings.
- The response is `207 Multi-Status`. **Treat it as success and read the array.**
  A batch of 60 with 2 bad rows gives you 58 `created` and 2 `failed`. One bad
  sale must never block a week of trading.
- `unit_price_cents` comes from the device. An offline till may have been
  charging last week's price; the receipt must reflect what the customer
  actually paid.
- `sold_at` is the device clock. Send it as-is. The server records its own
  `synced_at`. Don't try to correct skew.

### Pull: `GET /shops/{shopId}/sync?since=`

```
First launch  →  GET /shops/{id}/sync                    (is_full_snapshot: true)
Thereafter    →  GET /shops/{id}/sync?since={server_time from last response}
```

Store `server_time` from the response as your cursor. **Do not use the device
clock as the cursor** — a till with a wrong clock will silently miss updates
forever.

Apply `deleted_shop_product_ids` as local deletes.

### Conflicts

Last-write-wins on `client_updated_at`. Send it on every inventory write from a
device that may have been offline. A `409 STALE_WRITE` is not an error to
surface — the body contains the winning row; overwrite locally and move on.

---

## 6. Route privacy — a hard constraint, not a preference

Customer-facing responses **never** contain courier coordinates, route geometry,
or courier contact details before handover. ETA is a coarse band
(`"10-20min"`), never a timestamp.

The reason is specific: a live route displayed in a customer app publishes, in
advance, where a person carrying cash and goods is going to be, and when. In a
township that is a robbery vector, and it is a risk carried by a courier who is
walking or on a bicycle.

Two schemas exist for this reason:

| Schema | For | Contains |
|---|---|---|
| `CustomerDelivery` | Customer app | status, mode, eta_band, `"Thabo M."` |
| `CourierDelivery` | Courier app + admin | pickup addresses, coordinates, phones, sequence |

If you are writing customer-app code and want a field that is only on
`CourierDelivery`, that is the design working. Ask before working around it.

**Do not add a map with a moving pin to the customer app for the demo.** It is
the single most tempting Sunday-morning change and it undoes the point.

---

## 7. Integration walkthroughs

### 7.1 POS: scan → sell

```
GET  /shops/{id}/sync                          once at login, then delta
GET  /products/barcode/{barcode}?shop_id={id}  on every scan
   ├─ 200 → add line at shop_product.price_cents
   └─ 404 → prompt cashier
             POST /products                    {name, barcode}
             POST /shops/{id}/inventory        {product_id, price_cents, stock_qty}
POST /shops/{id}/sales                         online
POST /shops/{id}/sales/batch                   offline flush
GET  /shops/{id}/reports/daily                 cash-up
```

### 7.2 Customer: find the cheapest maize meal and order it

```
GET  /search/products?q=maize&lat=…&lng=…&radius_m=2000
        → products with offers[] sorted by price, plus avg_price_cents
POST /orders/quote          {fulfilment_type, dropoff_lat/lng, items[]}
        → quote_id, fee_breakdown[], per-shop legs[], 15-min expiry
POST /orders                {quote_id, dropoff_address, dropoff_notes}
GET  /orders/{id}           poll for leg status changes
```

Show `fee_breakdown` verbatim. An unexplained service fee is the fastest way to
lose a township customer.

### 7.3 Shop: handle an incoming order

```
GET  /shops/{id}/orders?status=pending          poll every 20s
POST /orders/{id}/legs/{shopId}/accept          optionally with fulfilled[] to short-ship
POST /orders/{id}/legs/{shopId}/reject          {reason}
POST /orders/{id}/legs/{shopId}/ready
```

An order spanning three shops has three independent legs. One shop rejecting
does not kill the order — it becomes `partially_accepted`. Build for that as the
normal case, because it is.

---

## 8. Things this contract deliberately does not do

Listed so nobody spends tomorrow looking for them.

| Not in v1 | Why | When |
|---|---|---|
| Stock reservation at order placement | Spazas also sell over the counter; a reservation would be fiction | Never, probably |
| Realtime order push | Polling at 20s is enough at demo scale | v2, Supabase Realtime |
| Card / Yoco payments | Marked N/A. Cash only. | v2 |
| Ratings and reviews | No trust problem at demo scale | v2 |
| Substitutions | Shops short-ship via `fulfilled[]` instead | v2 |
| Multi-language | English only | v2 |
| Refunds | Voids only, at the till | v2 |
| Courier onboarding / verification | The whole courier supply side is unbuilt | v2 |

---

## 9. Decisions

These were open questions. They are now decided, with the reasoning, so that a
client author never has to guess and never has to ask twice. Reopening one is a
product decision — say so in the tracker, do not work around it in a client.

### 9.1 Service fee constants — DECIDED 2026-08-24

`service_fee = base + per_extra_shop × (shops − 1) + per_km × ceil(km)`

| Constant | Value |
|---|---|
| base | **R18.00** |
| per extra shop | **R6.00** |
| per km | **R3.50** |
| courier share | **75%** of the service fee, fixed when delivery is requested |

One shop, 1 km: R21.50 — courier R16.13, platform R5.37.
Two shops, 2 km: R31.00 — courier R23.25, platform R7.75.

The previous R10 / R5 / R1.50 at an 80% share paid a courier **R9.20** for what
is roughly a half-hour round trip on foot: about R18–22 an hour, below minimum
wage, for a job that involves carrying cash. The platform kept R2.30, which
funds nothing. Courier supply "not existing as a pool in the township" is partly
a pricing problem, and that was the price.

R21.50 still sits under the R25–35 the national delivery apps charge, and on a
typical basket the price-comparison saving offsets much of it — which is the
actual pitch, not the delivery itself.

**Still open:** a minimum courier payout floor, around R15. The percentage model
pays least on short, cheap, single-shop orders, which are exactly the ones
couriers already do not want. Tracked in issue #34.

### 9.2 Radius cap for a multi-shop basket — DECIDED: 1500 m

`SHOPS_TOO_FAR_APART` fires beyond **1500 m**, reduced from 2000 m.

A foot or bicycle courier's default `max_radius_m` is 2000 m, and the courier
covers the shop-to-shop spread **plus** the leg to the customer. A 2000 m spread
can therefore build a route the assigned courier cannot reasonably walk. 1500 m
keeps the worst case inside the radius the courier actually agreed to.

### 9.3 Who verifies trading licences — DECIDED: platform, never self-service

Verification stays behind the `admin` role and lives in the operator console.
A shop owner submits; a human at SmartKasi approves or rejects with a reason.

There is currently no endpoint that approves one — `POST /shops/{shopId}/licence`
accepts a submission that nothing can act on. Tracked in issue #26, with the
console itself in #27.

### 9.4 Barcode format — DECIDED: EAN-13 canonical, normalise on write

Store digits only, and treat **EAN-13 as canonical**: a 12-digit UPC-A is
left-padded with a zero to 13. Normalise on write, at both `POST /products` and
the barcode lookup.

This is not cosmetic. The same physical product scans as UPC-A on one till and
EAN-13 on another; without normalisation the global catalogue silently forks per
shop, and cross-shop price comparison — the whole reason the catalogue is global
and keyed on barcode — stops working for exactly the products that matter most.

### 9.5 Multiple cashiers per till — DECIDED: no shift concept in v1

`cashier_id` is stamped from the authenticated user on every sale, so sales are
already attributed per person and `GET /shops/{id}/reports/daily` already buckets
by the Africa/Johannesburg trading day.

A shift or till-session concept is a **cash reconciliation** feature — "who was
on the till when the float went short" — not a sales-attribution one. Real, but
it belongs after a shop has more than one till, which no pilot shop does.

### 9.6 Courier payout share — DECIDED

Folded into 9.1: **75%**, fixed at the moment delivery is requested.

---

*Reopening a decision goes in the tracker. Do not silently work around the
contract; a workaround in one client is a bug in two.*
