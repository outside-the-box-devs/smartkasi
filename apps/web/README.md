# SmartKasi Dashboard (`apps/web`)

Next.js 16 App Router dashboard for shop owners. Runs on port 3001 in
development so it can sit next to the API on 3000.

## Overview

This is not only an admin panel. It is an **offline-first point of sale** that
happens to also do shop management. The POS tab writes every sale to IndexedDB
before it tries the network, and flushes through
`POST /v1/shops/{shopId}/sales/batch` — the same idempotent endpoint the Flutter
till uses. A shopkeeper with no signal keeps selling.

It talks to two services and holds no server state of its own:

- **Supabase GoTrue** for identity only — sign-in, sign-up, refresh.
- **The SmartKasi API** for everything else, with the GoTrue access token in an
  `Authorization: Bearer` header.

There are no Next.js route handlers, no server actions against a database, and
no Prisma client here. `src/app/**` is UI; `src/lib/api/**` is a typed `fetch`
wrapper.

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 16.3.1 | App Router, React Compiler enabled (`reactCompiler: true`), Turbopack. |
| React | 19.2.8 | |
| Astryx | `@astryxdesign/core` 0.4 | The component library. No raw `<div>` layout — see `CLAUDE.md` at the repo root. |
| TanStack Query | 5 | Server state, 60s `staleTime`, never retries a 401/403. |
| Zustand | 5 | Local UI state. |
| `idb` | 8 | IndexedDB wrapper behind the offline POS. |
| `react-hook-form` + `zod` | 7 / 4 | Forms and validation. |
| Leaflet + `leaflet-geosearch` | 1.9 / 4.4 | Shop map, and the OpenStreetMap/Nominatim address search in the shop wizard. |
| `html5-qrcode` | 2.3 | Barcode scanning from a webcam. |
| Playwright | 1.62 | E2E, Chromium only. |

## Environment variables

**Read this before deploying.** All three variables are `NEXT_PUBLIC_`, which
means Next **inlines them into the bundle at build time**. Setting them on a
running deployment changes nothing until you rebuild. Leaving them unset does
not fail — the code falls back to localhost and the app silently talks to
nothing.

| Variable | Required | Fallback if unset | Read at |
|---|:--:|---|---|
| `NEXT_PUBLIC_API_URL` | yes | `http://localhost:3000/v1` | `src/lib/api/client.ts:9` |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | `http://127.0.0.1:54321` | `src/lib/auth/auth-service.ts:6` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | the well-known local-Supabase demo anon key | `src/lib/auth/auth-service.ts:8` |

Those fallbacks are correct for a local Supabase stack and wrong everywhere
else. On a deployed build the symptom is a login page that spins and a dashboard
with no data, with no error mentioning configuration — so if the app looks
"empty" after a deploy, check these first.

There is **no `.env.example` in this package**. Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from `npx supabase status`>
```

For the hosted stack, point `NEXT_PUBLIC_API_URL` at
`https://api-production-5594.up.railway.app/v1` and the Supabase pair at the
`wndilblmkkdyzpffmwap` project.

## Getting started

```bash
npm install          # from the repo root — this is an npm workspace
npm run dev          # http://localhost:3001
```

You need a running API and a seeded database, or there is nothing to log in to.
The full path is in the [root README](../../README.md#clone-to-running-in-order);
the short version, from `apps/api`:

```bash
npx prisma migrate deploy && npm run db:users && npx prisma db seed && npm run dev
```

Then sign in as `thoko@smartkasi.test` / `Password123!` — a seeded shop owner
with two shops, stock and a live order. A `customer` account can sign in but has
nothing to manage; the dashboard is built for `shop_owner`.

### Scripts

| Script | What it does |
|---|---|
| `dev` | `next dev -p 3001` |
| `build` | `next build` |
| `start` | `next start` — **no `-p`**, deliberately, so Railway can assign `$PORT`. It used to be `next start -p 3001`, which meant the service bound the wrong port and never became reachable. |
| `check-types` | `tsc --noEmit` |
| `lint` | `eslint` — read-only here. (Unlike `apps/api`, this one is **not** `--fix`.) |

## Routes

| Path | What it is |
|---|---|
| `/` | Redirects straight to `/dashboard`. There is no marketing page. |
| `/auth/login`, `/auth/register` | GoTrue password auth. |
| `/dashboard` | Overview. |
| `/dashboard/shops` | The owner's shops. |
| `/dashboard/shops/new` | Three-step creation wizard. Step 2 picks coordinates with an OpenStreetMap address search, because typing lat/lng was losing people. |
| `/dashboard/shops/[id]` | Shop detail — five tabs. |
| `/dashboard/map` | Leaflet map of shops. |
| `/dashboard/orders` | Incoming order legs. |

Shop detail tabs are `overview`, `license`, `inventory` (labelled "Stock"),
`pos` ("Sell") and `flyers`. **The tab is URL state** (`?tab=stock`), so a
refresh, the back button and a shared link all land in the same place. Each
panel is a `next/dynamic` import with `ssr: false` — they pull in a camera and
large tables, and there is no reason to ship that to someone looking at the
overview.

## Project structure

```
src/
  app/
    layout.tsx providers.tsx globals.css
    auth/{login,register}/page.tsx
    dashboard/
      layout.tsx                 side nav, theme toggle, sign out
      page.tsx map/ orders/
      shops/ shops/new/ shops/[id]/
  components/
    POSPanel.tsx                 the offline till
    InventoryPanel.tsx           stock table and edits
    LicensePanel.tsx             trading-licence submission
    FlyersPanel.tsx              promotions; badges advertising_only shops
    BarcodeScanner.tsx           html5-qrcode wrapper
    LocationPicker.tsx           Leaflet + Nominatim search
    ShopMap.tsx LowStockAlert.tsx
  hooks/                         use-shops, use-orders, use-feedback, use-count-up
  lib/
    api/                         client.ts + one module per API area
    auth/                        auth-context.tsx, auth-service.ts, RequireAuth.tsx
    auth.ts                      DEAD — nothing imports it; see Known issues
    offline-db.ts                IndexedDB via idb
  themes/butter/                 an alternative Astryx theme
e2e/                             Playwright specs + checked-in reference screenshots
```

## API integration

**Base URL**: `NEXT_PUBLIC_API_URL`, default `http://localhost:3000/v1`.

`src/lib/api/client.ts` is the only thing that calls `fetch`. It injects the
bearer token, normalises failures into `ApiError { status, code, message }`, and
on a `401` clears the session and redirects to `/auth/login` exactly once
(a module-level `redirecting` flag, so a page firing six parallel queries does
not produce six redirects).

| Module | Covers |
|---|---|
| `shops.ts` | list/create/update, geo search, licence submission |
| `inventory.ts` | stock list, add, edit, bulk upsert, low stock |
| `catalog.ts` | product search, barcode lookup |
| `sales.ts` | single sale and the idempotent batch flush |
| `orders.ts` | order legs: accept, reject, ready |
| `flyers.ts` | promotions |
| `uploads.ts` | R2 presign |

The client follows [`packages/contract/openapi.yaml`](../../packages/contract/openapi.yaml),
not the other way round. When the presign call disagreed with the spec, the
client was fixed rather than the spec widened. There is no codegen — these
modules are hand-written against the contract.

## Auth

`src/lib/auth/auth-service.ts` talks to GoTrue directly over `fetch`; there is
no `@supabase/supabase-js` dependency in this package. The session lives in
`localStorage` under `smartkasi_token`, `smartkasi_refresh_token` and
`smartkasi_user`. `AuthProvider` (`auth-context.tsx`) exposes it and
`RequireAuth` gates the dashboard.

The role a user has is read from the token's `app_metadata.role` claim, which
the database computes at mint time. Nothing in this app can grant a role — see
`apps/api/README.md` § "The role claim is built in the database".

## Offline POS

`src/lib/offline-db.ts` opens IndexedDB `smartkasi-pos` v1 with three stores:

| Store | Key | Holds |
|---|---|---|
| `inventory` | `shopProductId` | Price and stock, so the till can price an item with no network. |
| `salesQueue` | `client_sale_id` | Sales not yet accepted by the server. |
| `products` | `barcode` | Barcode → product cache. |

Checkout writes to `salesQueue` **before** it tries the network, always. If
`navigator.onLine` is false it stops there and tells the cashier it will sync.
If the push fails it keeps the queued row and says the sale is safe on this
device. Either way the sale is never lost mid-sync.

Idempotency is the server's `@@unique([shopId, clientSaleId])`: the till
generates `client_sale_id` with `crypto.randomUUID()` at the moment of sale and
keeps it, so replaying a queue produces one sale row no matter how many times it
is flushed.

## Theme

Light is the default, **not** the OS preference. Server render and first-time
visitors get light; `prefers-color-scheme` is only followed once the user picks
"Auto" in the toggle. Shopkeepers use these phones outdoors, and a dark till in
sunlight is unreadable.

Tokens come from `packages/theme/src/tokens.json` through
`packages/theme/src/smartkasi`. Note that `providers.tsx` imports it by relative
path (`../../../../packages/theme/src/smartkasi`) rather than by the
`@smartkasi/theme` package name — it works, but it is why `next.config.mjs` has
to `transpilePackages` it.

## Testing

```bash
npx playwright test              # 10 tests across 2 specs
npx playwright test --ui
```

`playwright.config.ts` starts `npm run dev` itself and waits on
`http://localhost:3001/dashboard`, reusing an existing server if one is already
up. Chromium only, one worker, `fullyParallel: false` — the specs sign in and
mutate shared demo data, so they are not safe to run in parallel.

| Spec | Tests | Covers |
|---|:--:|---|
| `e2e/auth.spec.ts` | 3 | Login and register. |
| `e2e/admin-shops.spec.ts` | 7 | Shops list, shop detail, the tabs. |

Overrides: `E2E_BASE_URL` to point at a deployment, `E2E_NO_SERVER=1` to skip
starting a dev server. Reference screenshots are checked in next to the specs.

Playwright is **not** in CI — `.github/workflows/ci.yml` covers `apps/api`, the
contract and the Flutter packages, and this app is only typechecked as part of
the root `check-types`.

## PWA

`@ducanh2912/next-pwa` is a dependency and is **not currently active**.
`next.config.mjs` documents why: the plugin is Webpack-based and this project
builds with Turbopack. `public/manifest.json` still makes the app installable,
and `providers.tsx` registers `/sw.js` in production if one is present. To get
full Workbox behaviour, build with `next build --webpack` and uncomment the
`withPWA` wrapper in `next.config.mjs`.

## Known issues

| Thing | Detail |
|---|---|
| No `.env.example` | The three `NEXT_PUBLIC_*` variables are documented above and nowhere else in this package. |
| `src/lib/auth.ts` is dead | A second, older GoTrue helper. Nothing imports `@/lib/auth` — the live one is `src/lib/auth/`. It also reads a `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` that no other file uses. Delete it. |
| Hardcoded fallback anon key | The local-Supabase demo key is embedded as a default in both auth modules. It is a public, well-known test key and not a leak, but it is why a misconfigured deploy fails quietly instead of loudly. |
| Offline flush is manual or per-sale | There is a "sync all" action and a flush on checkout, but nothing listens for the network coming back. Issue #24. |
| The till cannot price an unknown item offline | The `inventory` and `products` stores only help for items already cached. Issue #22, the last pilot blocker. |
| Playwright not in CI | See above. |
