# SmartKasi Flutter apps

Three deployable apps, one shared package. The apps are shells — each `main.dart`
is two lines — and every screen, model and API call lives in
`packages/smartkasi_shared`.

```
apps/mobile/
  customer_app/       smartkasi_customer   — browse, compare, order, track
  shop_owner_app/     smartkasi_shop_owner — POS, inventory, order legs
  delivery_app/       smartkasi_delivery   — job board, pickup run, handover
  packages/
    smartkasi_shared/ everything the three have in common
```

## Why the apps are empty

Each app's entire `lib/` is one file:

```dart
import 'package:smartkasi_shared/smartkasi_shared.dart';

Future<void> main() => runSmartKasiMobileApp(SmartKasiAppKind.customer);
```

`runSmartKasiMobileApp` reads `--dart-define` configuration, initialises
Supabase, builds the controller graph, and picks the root widget from the
`SmartKasiAppKind`. The three apps exist as separate Flutter projects because
they ship to three different audiences with different bundle ids, icons and
permissions — not because they are three different codebases.

**Write code in `packages/smartkasi_shared`.** Something in an app's own `lib/`
is either a mistake or needs a very good reason.

## Requirements

- Flutter with Dart SDK `^3.11.5` (every `pubspec.yaml` pins it)
- An Android emulator / iOS simulator / physical device
- Nothing else. There is no `.env`, no codegen step and no melos workspace —
  each package resolves independently with `flutter pub get`.

## Run

```bash
cd apps/mobile/customer_app   && flutter run
cd apps/mobile/shop_owner_app && flutter run
cd apps/mobile/delivery_app   && flutter run
```

Out of the box the apps talk to the **live** API and the hosted Supabase
project. There is no mock server any more — the Prism server on `:4010` was
retired once courier dispatch stopped being a stub, so a failure here is a real
failure and is worth reading.

Demo credentials are prefilled per app. The password for all demo users is
`Password123!`.

| App | Prefilled account | Role |
|---|---|---|
| `customer_app` | `customer@smartkasi.test` | customer |
| `delivery_app` | `courier@smartkasi.test` | courier |
| `shop_owner_app` | `thoko@smartkasi.test` | shop_owner |

## Configuration

All configuration is `--dart-define`, resolved in
[`packages/smartkasi_shared/lib/src/config.dart`](packages/smartkasi_shared/lib/src/config.dart).
Defaults are compiled in, so the apps run with no flags at all.

| Define | Default |
|---|---|
| `SMARTKASI_API_BASE_URL` | `https://api-production-5594.up.railway.app/v1` |
| `SUPABASE_URL` | `https://wndilblmkkdyzpffmwap.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | a bundled publishable key |
| `SMARTKASI_DEFAULT_LAT` | `-26.2380` (Orlando West, Soweto) |
| `SMARTKASI_DEFAULT_LNG` | `27.9083` |

`SUPABASE_ANON_KEY` is still read as a legacy fallback, but
`SUPABASE_PUBLISHABLE_KEY` wins when both are set. Prefer the new name.

Point an app at a local stack:

```bash
flutter run \
  --dart-define=SMARTKASI_API_BASE_URL=http://10.0.2.2:3000/v1 \
  --dart-define=SUPABASE_URL=http://10.0.2.2:54321 \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=<anon key from `npx supabase status`>
```

`10.0.2.2` is how the Android emulator reaches the host machine's `localhost`.
On an iOS simulator use `localhost`; on a physical device use the machine's LAN
address.

`--dart-define` values are **compiled in**. Changing one means a rebuild, not a
hot reload.

## Verify

This is what CI's `mobile` job runs, package by package:

```bash
cd apps/mobile/packages/smartkasi_shared && flutter pub get && flutter analyze && flutter test
cd ../../customer_app                    && flutter pub get && flutter analyze
cd ../shop_owner_app                     && flutter pub get && flutter analyze
cd ../delivery_app                       && flutter pub get && flutter analyze
```

Only `smartkasi_shared` has a `test/` directory. `flutter test` on a package
without one is an **error**, not a pass, which is why the CI job guards on the
directory existing rather than running it everywhere.

## Where things are

| Concern | File |
|---|---|
| App entry, DI graph, theme mode | `packages/smartkasi_shared/lib/src/bootstrap.dart` |
| Configuration and app kind | `packages/smartkasi_shared/lib/src/config.dart` |
| API client (Dio) | `packages/smartkasi_shared/lib/src/api.dart` |
| Controllers: auth, cart, POS cart, offline queue, catalogue sync, theme | `packages/smartkasi_shared/lib/src/controllers.dart` |
| Models | `packages/smartkasi_shared/lib/src/models/` |
| Per-app screens | `packages/smartkasi_shared/lib/src/apps/{customer,delivery,shop_owner}/` |
| Shared widgets | `packages/smartkasi_shared/lib/src/ui/` |

See [`packages/smartkasi_shared/README.md`](packages/smartkasi_shared/README.md)
for the package in detail.

## Two constraints that are not negotiable

**Money is integer cents.** Every API field ends `_cents`. `zar(1850)` renders
`R18.50`. Never parse a rand string.

**A customer never sees a courier's position.** `CustomerDelivery` carries a
status, a mode and an ETA *band* — no coordinates, no route, no precise ETA. A
live route in a township tells anyone holding the phone where a person carrying
cash will be, and when. There is a test in `smartkasi_shared` asserting the
shape stays route-free. Do not add a moving pin for a demo.

## Reading list

- [`docs/API_CONTRACT.md`](../../docs/API_CONTRACT.md) — read once before writing
  a request. Conventions, auth, the LIVE/STUB table, route privacy.
- [`packages/contract/openapi.yaml`](../../packages/contract/openapi.yaml) —
  field-level truth. Frozen; additive changes only.
- [`apps/api/README.md`](../api/README.md) — how auth actually works (ES256 /
  JWKS) and how to get a token by hand.
