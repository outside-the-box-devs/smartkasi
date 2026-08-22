# SmartKasi Flutter Apps

This folder contains three deployable Flutter apps backed by one shared package:

- `customer_app` - browse shops, compare prices, build a basket, quote/place orders, track delivery safely, AI dish basket.
- `delivery_app` - courier login, available jobs, pickup/drop-off workflow, payout and cash-to-collect checks.
- `shop_owner_app` - shop dashboard, POS barcode flow, offline sale queue, inventory edits, low-stock alerts, incoming order legs, licence submission.
- `packages/smartkasi_shared` - API client, Supabase auth, theme, models, controllers, and reusable UI.

## Runtime configuration

The API defaults to the live Railway base:

```bash
https://api-production-5594.up.railway.app/v1
```

Protected flows require the Supabase publishable/anon key. Pass it at launch:

```bash
flutter run --dart-define=SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Optional overrides:

```bash
--dart-define=SMARTKASI_API_BASE_URL=https://api-production-5594.up.railway.app/v1
--dart-define=SUPABASE_URL=https://wndilblmkkdyzpffmwap.supabase.co
--dart-define=SMARTKASI_DEFAULT_LAT=-26.238
--dart-define=SMARTKASI_DEFAULT_LNG=27.9083
```

Demo accounts are prefilled per app. Password for all demo users is `Password123!`.

## Run

```bash
cd apps/mobile/customer_app
flutter run --dart-define=SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

cd ../delivery_app
flutter run --dart-define=SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

cd ../shop_owner_app
flutter run --dart-define=SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Verify

```bash
cd apps/mobile/packages/smartkasi_shared
flutter analyze
flutter test

cd ../../customer_app && flutter analyze
cd ../delivery_app && flutter analyze
cd ../shop_owner_app && flutter analyze
```
