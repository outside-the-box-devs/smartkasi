# SmartKasi mock server

A fake SmartKasi API that returns real-shaped JSON from `packages/contract/openapi.yaml`.
**Use this until the real backend is up on Sat 22 Aug at 10:00.** No database,
no setup, no waiting for the backend team.

## Run it

From the repo root:

```bash
npm run mock
```

or directly:

```bash
npx @stoplight/prism-cli mock packages/contract/openapi.yaml --port 4010 --host 0.0.0.0
```

First run downloads Prism (~30s). Leave it running in its own terminal.

Base URL: `http://localhost:4010` — **note: no `/v1`.**

Prism serves the raw paths from the spec, so the `/v1` in the `servers` block is
not part of the mock's URLs. `GET /health` works; `GET /v1/health` gives 404.
When you point at the real backend on Saturday, put the `/v1` back. Keep the
base URL in one constant so that swap is a one-line change.

`--host 0.0.0.0` matters — without it an Android emulator or a phone on the same
Wi-Fi can't reach it.

| Client | Base URL to use |
|---|---|
| Flutter, Android emulator | `http://10.0.2.2:4010` |
| Flutter, iOS simulator | `http://localhost:4010` |
| Flutter, physical device | `http://<your-laptop-LAN-ip>:4010` |
| Next.js | `http://localhost:4010` |

## Send a Bearer token — Prism enforces it

Prism honours the `security` block in the spec. **A request without an
`Authorization` header gets a `401`**, even though the mock never looks at the
token:

```
Authorization: Bearer mock
```

Any non-empty string works. Public endpoints (`/shops`, `/products`, `/search`,
`/flyers`) work without it. Wire the header into your HTTP client now and you
will not discover a missing header at 10:01 on Saturday.

## Try it

```bash
curl http://localhost:4010/health

curl "http://localhost:4010/shops?lat=-26.238&lng=27.9083&radius_m=2000"

curl "http://localhost:4010/search/products?q=maize&lat=-26.238&lng=27.9083"

curl -H 'Authorization: Bearer mock' \
  "http://localhost:4010/products/barcode/6001068000456?shop_id=7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa"

curl -X POST http://localhost:4010/shops/7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa/sales/batch \
  -H 'Authorization: Bearer mock' -H 'Content-Type: application/json' \
  -d '{"sales":[{"client_sale_id":"11111111-1111-4111-8111-111111111111","sold_at":"2026-08-21T14:32:11Z","subtotal_cents":3450,"total_cents":3450,"items":[{"product_id":"3f0a9d10-aaaa-4c11-9999-111111111111","qty":1,"unit_price_cents":3450}]}]}'
```

That last one returns a `207` with one `created`, one `duplicate` and one
`failed` — the exact mixed batch your queue-flush code has to handle. Use it as
your fixture.

## Getting the error paths

By default Prism returns the first (success) example. To exercise your error
handling, ask for a specific status:

```bash
# force the 404 branch of a barcode scan
curl -H 'Authorization: Bearer mock' -H 'Prefer: code=404' \
  http://localhost:4010/products/barcode/0000000000000

# force an expired quote
curl -X POST -H 'Authorization: Bearer mock' -H 'Prefer: code=409' \
  -H 'Content-Type: application/json' -d '{"quote_id":"qt_expired"}' \
  http://localhost:4010/orders

# force an auth failure
curl -H 'Authorization: Bearer mock' -H 'Prefer: code=401' http://localhost:4010/me
```

Wire a debug toggle in your app that adds a `Prefer` header. You will need every
one of these paths on Sunday, and 10 p.m. Saturday is a bad time to find out
your app crashes on a `404`.

## Validation mode (recommended)

```bash
npx @stoplight/prism-cli mock ../packages/contract/openapi.yaml --port 4010 --errors
```

With `--errors`, Prism rejects requests that violate the contract instead of
politely returning a success. If your request body is wrong, you find out now
rather than at integration. Turn this on.

## Generate a typed client instead of hand-writing HTTP

**Dart / Flutter:**
```bash
npx @openapitools/openapi-generator-cli generate \
  -i ../packages/contract/openapi.yaml -g dart-dio -o ./generated/dart
```

**TypeScript / Next.js:**
```bash
npx openapi-typescript ../packages/contract/openapi.yaml -o ./generated/api.d.ts
```

Regenerate whenever the contract version bumps. Do not hand-edit generated code.

## Postman / Insomnia

Import `packages/contract/openapi.yaml` directly — both read OpenAPI 3.0 natively and will
build the full request collection with examples. Set the collection variable
`baseUrl` to `http://localhost:4010` for the mock, or
`http://localhost:3000/v1` for the real backend.

## What the mock does not do

- No persistence. `POST` then `GET` will not return what you posted.
- No idempotency. The batch endpoint returns its fixed example regardless.
- Auth is checked for *presence* only — any bearer token passes, and there are
  no roles or permission errors.
- No distance calculation — `distance_m` is whatever is in the example.

The mock exists to unblock UI work on **shapes**. Test behaviour against the
real backend from 10:00.
