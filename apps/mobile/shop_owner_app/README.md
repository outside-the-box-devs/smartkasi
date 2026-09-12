# SmartKasi Owner (`smartkasi_shop_owner`)

The shopkeeper's app: a till that keeps selling with no signal, barcode-driven
stock, and the orders arriving from customers who are not in the shop.

| | |
|---|---|
| Role served | `shop_owner` |
| Android application id | `za.co.smartkasi.smartkasi_shop_owner` |
| Display name | SmartKasi Owner |
| Demo account | `thoko@smartkasi.test` / `Password123!` (prefilled) |

## This app is a shell

`lib/main.dart` is the whole of it:

```dart
import 'package:smartkasi_shared/smartkasi_shared.dart';

Future<void> main() => runSmartKasiMobileApp(SmartKasiAppKind.shopOwner);
```

Every screen lives in
[`../packages/smartkasi_shared/lib/src/apps/shop_owner/`](../packages/smartkasi_shared/lib/src/apps/shop_owner/).
This project exists to own the bundle id, the icon, the fonts and the
permissions. **Do not add features here.**

## What it does

The app first resolves which shop you own (`context_gate.dart`) and then shows
five tabs:

| Tab | What it does | API |
|---|---|---|
| Home | Today's takings, top products, low-stock alerts | `GET /shops/{id}/reports/daily`, `GET /shops/{id}/inventory/low-stock` |
| POS | Scan, tender cash, give change — **works offline** | `POST /shops/{id}/sales/batch` |
| Stock | Inventory list, add and edit items, barcode add | `GET/POST/PATCH /shops/{id}/inventory`, `GET /products/barcode/{barcode}` |
| Orders | Incoming order legs: accept, reject, mark ready | `GET /shops/{id}/orders`, `POST /orders/{id}/legs/{shopId}/{accept,reject,ready}` |
| Account | Profile, shop details, licence, sign out | `GET /me`, `GET/PATCH /shops/{id}` |

## The till is the point

A sale is written to local storage **before** the app tries the network, always.
`OfflineSaleQueue.buildSale` generates `client_sale_id` once, at the moment of
sale, and that id is persisted with the sale and reused on every retry.

The server has `@@unique([shopId, clientSaleId])`, so replaying a queue produces
one sale row no matter how many times it is flushed. There is no sync engine,
no merge algorithm, and no vector clock — every extra mechanism there would be a
new way to lose a day's takings.

`flush` treats the batch endpoint's `207` as a success and then reads every row:
it keeps only the sales that came back `failed`. A `duplicate` is a success —
it means an earlier flush got through and the reply did not.

Two behaviours that surprise people and are deliberate:

- **A sale goes through even when it takes stock negative.** A shop that sold
  its last tin while offline has sold it. Negative stock is a signal for the
  owner to count, not an error for the cashier.
- **`CatalogueSync` keeps the shop's catalogue warm** from
  `GET /shops/{id}/sync` so the till can price a scan with no signal. It only
  covers items already pulled; an item that has never synced cannot be priced
  offline. That is issue #22 and the last pilot blocker.

## Run

```bash
flutter pub get
flutter run
```

Defaults point at the live API and the hosted Supabase project, so this works
with no flags. Against a local stack:

```bash
flutter run \
  --dart-define=SMARTKASI_API_BASE_URL=http://10.0.2.2:3000/v1 \
  --dart-define=SUPABASE_URL=http://10.0.2.2:54321 \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=<anon key from `npx supabase status`>
```

`10.0.2.2` is the Android emulator's route to the host's `localhost`; use
`localhost` on an iOS simulator and the machine's LAN address on a real device.
Every define is compiled in, so a change needs a rebuild. Full table:
[`../README.md`](../README.md#configuration).

To sign in as an owner you need an account whose `profiles.role` is
`shop_owner`. On seeded data that is `thoko@`, `sipho@` or `naledi@`. Signing up
fresh makes you a `customer`; only `PATCH /v1/admin/users/{userId}/role`, called
by an admin, changes that — deliberately, since self-service elevation is how
anyone becomes anything.

## Testing the offline path for real

Turn aeroplane mode on mid-shift, make several sales, turn it back off, and
flush. Then check the server agrees:

```bash
cd apps/api
npm run smoke:auth        # includes the replay and mixed-batch checks
```

## Verify

```bash
flutter pub get && flutter analyze
```

This is what CI runs. There is no `test/` directory here — the tests live in
`smartkasi_shared`.

## Permissions

| Platform | Permission | Why |
|---|---|---|
| Android | `INTERNET`, `CAMERA` | Barcode scanning for POS and inventory. |
| iOS | `NSCameraUsageDescription` | Same. |

No location permission is requested; a shop's coordinates are set on the shop
record, not read from the till.
