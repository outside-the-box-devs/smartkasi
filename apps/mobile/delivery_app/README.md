# SmartKasi Courier (`smartkasi_delivery`)

The courier's app: take a job off the board, collect from every shop in the
order, hand over to the customer, get paid.

| | |
|---|---|
| Role served | `courier` |
| Android application id | `za.co.smartkasi.smartkasi_delivery` |
| Display name | SmartKasi Courier |
| Demo account | `courier@smartkasi.test` / `Password123!` (prefilled) |

## This app is a shell

`lib/main.dart` is the whole of it:

```dart
import 'package:smartkasi_shared/smartkasi_shared.dart';

Future<void> main() => runSmartKasiMobileApp(SmartKasiAppKind.delivery);
```

Every screen lives in
[`../packages/smartkasi_shared/lib/src/apps/delivery/`](../packages/smartkasi_shared/lib/src/apps/delivery/).
This project exists to own the bundle id, the icon, the fonts and the
permissions. **Do not add features here.**

## What it does

Three tabs:

| Tab | What it does | API |
|---|---|---|
| Jobs | The open job board — order number, pickup count, total distance, estimated payout, mode, and when the offer expires | `GET /courier/jobs`, `POST /courier/jobs/{deliveryId}/accept` |
| Active | The current run: one tick per shop, then the handover | `POST /courier/jobs/{deliveryId}/collect`, `POST /courier/jobs/{deliveryId}/deliver` |
| Account | Profile, sign out, theme | `GET /me` |

Accepting is a race, and the loser is told so: a second courier accepting the
same job gets a `409`, not a silent failure.

The active run carries everything a courier needs and nothing else — pickups in
sequence with shop name, address, item count and phone; the dropoff address and
notes; the customer's first name and phone; the payout; and the cash to collect.
A collected stop cannot be un-collected.

## Payout and cash

Both are integer cents, rendered through `zar()`.

`payoutCents` is the courier's share of the service fee, **fixed at the moment
delivery is requested**. The model is R18 base + R6 per extra shop + R3.50/km,
courier take 75% — decided in issue #34 and documented in
`docs/API_CONTRACT.md` § 9. The previous numbers paid a courier R9.20 for a
half-hour round trip on foot, which is below minimum wage for a job that
involves carrying cash.

`cashToCollectCents` is what the customer owes on delivery. It is not the
courier's money.

## Verification gates the job board

A courier who is not verified, or who is offline, gets a `422` from
`GET /courier/jobs` rather than an empty list — the distinction between "no work
right now" and "you are not eligible" is deliberate.

On `main` today **nothing writes `couriers.is_verified`**, so an applicant stays
`pending` for ever and the seeded Thabo is the only courier who can take a job.
The admin endpoints that fix this (`PATCH /admin/couriers/{courierId}/verify`)
are on the unmerged `feat/admin-verification` branch — deployed to Railway, but
not on `main`. See the root [`README.md`](../../../README.md#production-is-ahead-of-main).

Note also that courier onboarding (`POST /courier/application`,
`GET`/`PATCH /courier/me`, `POST /courier/online|offline`) exists on the API but
has **no client method in `smartkasi_shared` yet** — there is no "apply to be a
courier" screen in this app. A courier has to be provisioned outside it.

## The courier sees a route; the customer never does

This app receives pickup addresses and phone numbers because a courier cannot do
the job without them. The customer-facing `CustomerDelivery` shape carries none
of it — no coordinates, no route, no courier phone, no precise ETA. A live route
in a township tells anyone holding the phone where a person carrying cash will
be, and when. Keep the asymmetry. See `docs/API_CONTRACT.md` § Route privacy.

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

For a job to appear on the board, a customer has to place an order and request
delivery. The fastest way to produce one is
`cd apps/api && npm run smoke:auth`, which runs the whole dispatch path — but
note it writes to whatever database it points at.

## Verify

```bash
flutter pub get && flutter analyze
```

This is what CI runs. There is no `test/` directory here — the tests live in
`smartkasi_shared`, including one that pins `CourierPickup.shop_id`, because
`collectJob` sends that id back and losing it is how a multi-shop run ticks off
the wrong spaza.

## Permissions

| Platform | Permission | Why |
|---|---|---|
| Android | `INTERNET`, `CAMERA` | Handover codes and proof-of-delivery photos. |
| iOS | `NSCameraUsageDescription` | Same. |

No location permission is requested, and no background location tracking exists
anywhere in this app. That is a decision, not an omission.
