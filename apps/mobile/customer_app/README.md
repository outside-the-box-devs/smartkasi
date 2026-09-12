# SmartKasi Customer (`smartkasi_customer`)

The shopper's app. Find the spaza shops within walking distance, compare what
they charge for the same item, build a basket that can span several of them,
place the order, and track the delivery.

| | |
|---|---|
| Role served | `customer` |
| Android application id | `za.co.smartkasi.smartkasi_customer` |
| Display name | SmartKasi |
| Demo account | `customer@smartkasi.test` / `Password123!` (prefilled) |

## This app is a shell

`lib/main.dart` is the whole of it:

```dart
import 'package:smartkasi_shared/smartkasi_shared.dart';

Future<void> main() => runSmartKasiMobileApp(SmartKasiAppKind.customer);
```

Every screen lives in
[`../packages/smartkasi_shared/lib/src/apps/customer/`](../packages/smartkasi_shared/lib/src/apps/customer/).
This project exists to own the bundle id, the icon, the fonts and the
permissions — not to hold code. **Do not add features here.**

## What it does

Five tabs:

| Tab | Screens | API |
|---|---|---|
| Browse | Nearby shops with real distances, shop detail, product detail, barcode scan | `GET /shops`, `GET /shops/{id}`, `GET /search/products`, `GET /products/barcode/{barcode}` |
| Basket | A cart that can hold items from more than one shop, with a live count badge | local `CartController`, then `POST /orders/quote` |
| Orders | Place, list and track — including the delivery, when there is one | `POST /orders`, `GET /orders`, `POST /orders/{id}/delivery`, `GET /deliveries/{id}` |
| AI | "What do I need for a dish?" → an ingredient basket | `POST /ai/dish-ingredients` — **a stub.** The shape is real and contractual; the values are fake. Do not build logic on them. |
| Account | Profile, sign in/out, theme | `GET /me`, `PATCH /me` |

Cross-shop price comparison is the reason the catalogue is global and keyed on
barcode: if each shop owned its own product list there would be nothing to
compare. Shop-local items with no barcode (a kota, say) are correctly excluded
from comparison and still sold.

Ordering from an `advertising_only` shop returns `422` — the third seeded shop
is one, deliberately, so the failure path is testable.

## Delivery tracking shows no route

`CustomerDelivery` carries a status, a mode and an **ETA band** — nothing else.
No coordinates, no polyline, no courier phone number, no precise ETA.

A live route in a township tells anyone holding the phone where a person
carrying cash will be, and when. This is a safety constraint, not a product gap,
and there is a test in `smartkasi_shared` asserting the shape stays route-free.
Do not add a moving pin, including for a demo. See `docs/API_CONTRACT.md`
§ Route privacy.

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
Optional: `SMARTKASI_DEFAULT_LAT` / `SMARTKASI_DEFAULT_LNG` (default Orlando
West, Soweto — where the seeded shops are). Every define is compiled in, so a
change needs a rebuild.

Full table of defines: [`../README.md`](../README.md#configuration).

## Verify

```bash
flutter pub get && flutter analyze
```

This is what CI runs. There is no `test/` directory here — the tests live in
`smartkasi_shared`, and `flutter test` on a package with no tests is an error
rather than a pass.

## Permissions

| Platform | Permission | Why |
|---|---|---|
| Android | `INTERNET`, `CAMERA` | Barcode scanning while shopping. |
| iOS | `NSCameraUsageDescription` | Same. |

No location permission is requested. Search coordinates come from the
`SMARTKASI_DEFAULT_*` defines, not from the device.
