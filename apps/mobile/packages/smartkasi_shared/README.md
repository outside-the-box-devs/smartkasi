# smartkasi_shared

The entire SmartKasi Flutter application — API client, auth, models, state
controllers, theme, shared widgets, and every screen of all three apps.

`customer_app`, `shop_owner_app` and `delivery_app` are shells. Each one's
`lib/main.dart` is two lines that call into this package. **This is where you
write code.**

Private path dependency (`publish_to: 'none'`); it is not on pub.dev.

## Usage

```dart
import 'package:smartkasi_shared/smartkasi_shared.dart';

Future<void> main() => runSmartKasiMobileApp(SmartKasiAppKind.customer);
```

`runSmartKasiMobileApp` reads `--dart-define` configuration, initialises
Supabase when a URL and key are present, constructs the controller graph, and
picks the root widget from the `SmartKasiAppKind` — `CustomerApplication`,
`DeliveryApplication` or `ShopOwnerApplication`. `SmartKasiAppKind` also carries
the window title, the role label and the prefilled demo email for that app.

## Layout

```
lib/
  smartkasi_shared.dart       the public surface — ten exports, nothing else
  src/
    bootstrap.dart            runSmartKasiMobileApp, SmartKasiApp, the DI graph
    config.dart               SmartKasiConfig.fromEnvironment, SmartKasiAppKind
    api.dart                  SmartKasiApi — one Dio client, 30 typed methods
    controllers.dart          ChangeNotifier state + SmartKasiScope
    theme.dart                smartKasiTheme(Brightness)
    models.dart               a `part` file; the real models live in models/
    models/
      json_helpers.dart       text(), asMapList(), zar(), ApiException
      catalog_models.dart     Shop, Product, Category, ProductSearchResult,
                              PriceStats, ProductOffer, BarcodeLookupResult
      inventory_models.dart   InventoryItem, DailyReport, TopProduct
      order_models.dart       Quote, QuoteLeg, Order, OrderLeg, OrderItem,
                              ShopOrderLeg, CartLine, FeeLine
      delivery_models.dart    CustomerDelivery, CourierDelivery, CourierJob,
                              CourierPickup
      dish_models.dart        DishBasket, DishIngredient
      sync_models.dart        SyncDelta
    ui/common.dart            layout, cards, inputs, states, auth, scanner
    apps/
      customer_app.dart       + customer/  browse, cart, orders, dish builder
      delivery_app.dart       + delivery/  jobs, active delivery, account
      shop_owner_app.dart     + shop_owner/ dashboard, POS, inventory, orders
```

`models.dart` and `ui/common.dart` are `part` aggregators, not barrel exports —
the files under `models/` and `ui/common/` are `part of` them and cannot be
imported directly.

## Dependencies

| Package | Used for |
|---|---|
| `dio` | The one HTTP client, in `api.dart`. |
| `supabase_flutter` | Identity only — sign in, sign up, refresh. |
| `shared_preferences` | The offline sale queue, the catalogue cache, theme mode. |
| `mobile_scanner` | Barcode scanning in the POS and the customer browse flow. |
| `connectivity_plus` | Network state. |
| `uuid` | `client_sale_id` — the offline idempotency key. |
| `intl`, `collection` | Formatting and list helpers. |

Note there is no local database. Offline state is JSON in `SharedPreferences`,
which is enough because the only thing that has to survive is a queue of sales
and one catalogue snapshot per shop.

## API client

`SmartKasiApi` wraps Dio and is constructed in `bootstrap.dart` with an access
token provider and a refresh callback from `AuthController`, so no call site
handles tokens. Methods are hand-written against
[`packages/contract/openapi.yaml`](../../../../packages/contract/openapi.yaml) —
there is no codegen anywhere on this project.

The surface, grouped:

| Area | Methods |
|---|---|
| Identity | `getMe`, `updateMe` |
| Shops | `listShops`, `getShop`, `createShop`, `updateShop`, `submitLicence` |
| Catalogue | `listProducts`, `createProduct`, `barcodeLookup`, `searchProducts` |
| Inventory | `inventory`, `lowStock`, `addInventory`, `updateInventory`, `bulkUpsertInventory` |
| Sync | `syncShop` |
| Sales | `createSale`, `batchSales`, `dailyReport` |
| Order legs (shop side) | `shopOrders`, `acceptLeg`, `rejectLeg`, `readyLeg` |
| Orders (customer side) | `quote`, `placeOrder`, `orders`, `order` |
| Delivery (customer side) | `requestDelivery`, `trackDelivery` |
| Courier | `courierJobs`, `acceptJob`, `collectJob`, `deliverJob` |
| Stub | `dishIngredients` |

Failures surface as `ApiException`, which carries the API's error `code` — the
contract's codes, not HTTP text.

Courier onboarding (`POST /courier/application`, `GET`/`PATCH /courier/me`,
`POST /courier/online|offline`) exists on the API but has **no client method
here yet**. A courier still has to be provisioned outside the app.

## Controllers

Plain `ChangeNotifier`s, no state-management package. They are bundled into
`SmartKasiDependencies` and handed down the tree by `SmartKasiScope`, an
`InheritedWidget`. `SmartKasiApp` listens to all of them and calls `setState` —
crude, and correct for an app this size.

| Controller | Holds |
|---|---|
| `AuthController` | The Supabase session, the `Profile`, `isSignedIn`, `canAuthenticate`. |
| `ThemeController` | Light/dark/system, persisted. |
| `CartController` | The customer's multi-shop basket — `count`, `subtotalCents`. |
| `PosCartController` | The till's current sale, as `PosLine`s. |
| `OfflineSaleQueue` | Sales not yet accepted by the server. |
| `CatalogueSync` | The till's local copy of its shop catalogue. |

### OfflineSaleQueue

Sales are queued per shop under `smartkasi.offlineSales.<shopId>` as raw JSON.

`buildSale` generates `client_sale_id` with `Uuid().v4()` **once, at sale time**,
and it is persisted with the sale and reused on every retry. That is the whole
offline-safety design: the server has `@@unique([shopId, clientSaleId])`, so a
queue replayed five times still produces one sale row.

`flush` posts the whole queue to `POST /v1/shops/{shopId}/sales/batch` and
treats the `207` as a success — it then inspects every row and keeps only the
sales whose status came back `failed`. A `duplicate` is a success, not an error:
it means a previous flush got through and the reply did not.

### CatalogueSync

Keeps the till able to price a scan with no signal, from
`GET /v1/shops/{shopId}/sync`. Two decisions worth knowing:

- It stores the **server's own JSON**, not re-serialised models, so a field this
  app does not read yet still survives the round trip and there is no second
  mapping to keep in step with the contract.
- Decoded rows are cached per shop, because `label` and `count` are read during
  `build` and the POS rebuilds on every keystroke in the cash-tendered field.
  Decoding a few hundred rows per frame is not free on a R1500 phone.

Being offline is not an error state here: `lastError` is for display only and
the cache stays usable.

## Money

Integer cents, everywhere. Every API field ends `_cents`.

```dart
zar(1850)   // 'R18.50'
```

`zar` is in `models/json_helpers.dart`. Never parse or build a rand string by
hand.

## Theme

`smartKasiTheme(Brightness)` builds both the light and dark `ThemeData`. The
palette traces back to `packages/theme/src/tokens.json` at the repo root, which
the web dashboard shares. Do not hardcode a colour in a widget.

## Tests

```bash
flutter pub get
flutter analyze
flutter test
```

This is the only package under `apps/mobile` with a `test/` directory, and it is
the only one CI runs `flutter test` against (`flutter test` on a package with no
tests is an error, not a pass).

`test/smartkasi_shared_test.dart` holds three tests, and each one pins something
that has already been got wrong or would be expensive to get wrong:

1. `zar(1850)` renders `R18.50`.
2. `CustomerDelivery.fromJson` keeps the customer-facing delivery shape
   **route-free** — a status, a mode, an ETA band, a courier display name. No
   coordinates, no route, no phone number. This is a safety constraint, not a
   modelling preference: a live route in a township tells anyone holding the
   phone where a person carrying cash will be, and when. See
   `docs/API_CONTRACT.md` § Route privacy.
3. `CourierPickup.fromJson` keeps `shop_id`. `collectJob` sends that id back, so
   losing it is how a multi-shop run ticks off the wrong spaza.

## Conventions

- **Write features here, not in an app's `lib/`.** Something in
  `customer_app/lib/` beyond `main.dart` is either a mistake or needs a reason.
- **The contract is frozen.** Additive changes only. If the client and
  `openapi.yaml` disagree, the spec is right.
- **Never reach for a role from the client.** `AuthController` reads the profile
  the API returns; the role claim is computed in the database at token-mint time
  and nothing on the device can influence it.
