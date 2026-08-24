-- =============================================================================
-- SmartKasi — Postgres / Supabase schema
-- Source of truth for the API contract in packages/contract/openapi.yaml
--
-- Run order:  schema.sql  ->  policies.sql (inline below)  ->  seed.sql
-- Target:     Supabase Postgres 15+ (no extensions beyond uuid-ossp + pg_trgm)
--
-- CONVENTIONS
--   * All money is BIGINT cents (ZAR). Never float. Never numeric-in-JSON.
--   * All ids are uuid v4, generated server-side unless the client needs
--     to generate them for offline idempotency (see sales.client_sale_id).
--   * All timestamps are timestamptz, stored UTC, emitted as ISO 8601.
--   * Stock is a LEDGER (stock_movements), not a mutable counter. The
--     counter on shop_products is a cached projection. This is what makes
--     replaying a week of offline POS sales safe.
--   * Coordinates are plain lat/lng doubles, NOT PostGIS geography.
--
-- WHY NO POSTGIS
--   Prisma has no support for the `geography` type -- it introspects as
--   Unsupported(...) and those columns cannot be read through the typed client
--   at all. Since the API is Prisma-first, geography would force raw SQL for
--   exactly the queries that matter. Plain doubles keep one data-access style.
--
--   The cost is real and you should know it: distance filtering is now a
--   bounding-box query on (lat, lng) plus a haversine calculation in the API,
--   so there is no GIST index and radius search degrades as the shop count
--   grows. At demo scale (tens of shops) this is free. Past a few thousand
--   shops, add PostGIS back and move those two queries to raw SQL.
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;   -- fuzzy product search

-- =============================================================================
-- ENUMS
-- =============================================================================

create type user_role         as enum ('customer', 'shop_owner', 'shop_staff', 'courier', 'admin');
create type licence_status    as enum ('none', 'pending', 'verified', 'rejected', 'expired');
create type shop_mode         as enum ('advertising_only', 'inventory_only', 'full');
create type payment_method    as enum ('cash', 'card', 'qr', 'account');
create type sale_status       as enum ('completed', 'voided');
create type stock_reason      as enum ('sale', 'restock', 'adjustment', 'order', 'void', 'shrinkage');
create type fulfilment_type   as enum ('delivery', 'collection');
create type order_status      as enum ('pending_payment', 'placed', 'accepted', 'partially_accepted',
                                       'preparing', 'ready', 'dispatched', 'completed', 'cancelled', 'rejected');
create type order_shop_status as enum ('pending', 'accepted', 'rejected', 'preparing', 'ready', 'collected', 'cancelled');
create type courier_mode      as enum ('foot', 'bicycle', 'vehicle');
create type delivery_status   as enum ('unassigned', 'assigned', 'en_route_pickup', 'collected', 'en_route_dropoff', 'delivered', 'failed');

-- =============================================================================
-- IDENTITY
-- Supabase owns auth.users. We never write passwords, never mint JWTs.
-- profiles is a 1:1 extension of auth.users.
-- =============================================================================

create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           user_role   not null default 'customer',
  full_name      text        not null,
  phone          text,                        -- E.164, e.g. +27821234567
  avatar_url     text,
  home_lat       double precision,            -- default delivery location
  home_lng       double precision,
  home_address   text,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on profiles (role);
create index profiles_home_point_idx on profiles (home_lat, home_lng);

-- Mirror role into the JWT so the API can authorise without a DB round trip.
-- (Supabase reads raw_app_meta_data into app_metadata on the access token.)
comment on column profiles.role is
  'Mirrored into auth.users.raw_app_meta_data->>''role'' by trigger; the API trusts the JWT claim and only reads this table for display.';

-- =============================================================================
-- SHOPS
-- =============================================================================

create table shops (
  id                  uuid primary key default uuid_generate_v4(),
  owner_id            uuid not null references profiles(id) on delete restrict,
  name                text not null,
  slug                text unique not null,
  description         text,
  phone               text,
  logo_url            text,

  -- Location. Bounding-box prefilter in SQL, exact haversine in the API.
  lat                 double precision not null,
  lng                 double precision not null,
  address_line        text not null,
  township            text,
  city                text,
  province            text,

  -- Compliance. accepts_orders is HARD-GATED on licence_status = 'verified'
  -- (see the check constraint). This is a legal requirement, not a nicety.
  trading_licence_no  text,
  licence_status      licence_status not null default 'none',
  licence_doc_url     text,
  licence_expires_at  date,

  -- Operating posture. A shop can join as advertising_only (upload flyers,
  -- no POS, no orders) — that is the low-friction onboarding path.
  mode                shop_mode not null default 'advertising_only',
  accepts_orders      boolean   not null default false,
  accepts_delivery    boolean   not null default false,
  is_active           boolean   not null default true,
  opens_at            time,
  closes_at           time,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint shops_orders_require_licence
    check (accepts_orders = false or licence_status = 'verified'),
  constraint shops_delivery_requires_orders
    check (accepts_delivery = false or accepts_orders = true)
);
create index shops_point_idx     on shops (lat, lng);
create index shops_owner_idx     on shops (owner_id);
create index shops_active_idx    on shops (is_active, accepts_orders);
create index shops_name_trgm_idx on shops using gin (name gin_trgm_ops);

-- Staff working a till. Owner is implicitly staff.
create table shop_staff (
  shop_id    uuid not null references shops(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  can_manage_inventory boolean not null default false,
  can_void_sales       boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (shop_id, user_id)
);

-- =============================================================================
-- CATALOG
--
-- KEY DESIGN DECISION: one GLOBAL products table keyed on barcode.
-- Cross-shop price comparison ("Tuckshop A - 500m - R18, Tuckshop B - 600m - R21")
-- is only possible if two shops scanning the same tin resolve to the same
-- product row. A per-shop product table makes that feature impossible.
--
-- Shops may still create their own items (loose goods, kotas, no barcode).
-- Those get created_by_shop_id set and barcode null, and are correctly
-- EXCLUDED from price comparison because they aren't comparable.
-- =============================================================================

create table categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  parent_id  uuid references categories(id) on delete set null,
  icon       text
);

create table products (
  id                 uuid primary key default uuid_generate_v4(),
  barcode            text unique,               -- EAN-13/UPC. null => shop-local item.
  name               text not null,
  brand              text,
  unit_size          text,                      -- '2L', '500g', '6 x 340ml'
  category_id        uuid references categories(id) on delete set null,
  image_url          text,
  created_by_shop_id uuid references shops(id) on delete set null,
  is_verified        boolean not null default false,  -- admin-curated global item
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint products_local_items_have_no_barcode
    check (created_by_shop_id is null or barcode is null)
);
create index products_barcode_idx   on products (barcode);
create index products_name_trgm_idx on products using gin (name gin_trgm_ops);
create index products_category_idx  on products (category_id);

-- =============================================================================
-- INVENTORY  (shop_products = "this shop stocks this product at this price")
-- =============================================================================

create table shop_products (
  id                  uuid primary key default uuid_generate_v4(),
  shop_id             uuid not null references shops(id) on delete cascade,
  product_id          uuid not null references products(id) on delete restrict,

  price_cents         bigint  not null check (price_cents >= 0),
  cost_cents          bigint  check (cost_cents >= 0),          -- never exposed to customers
  stock_qty           integer not null default 0,               -- cached projection of stock_movements
  low_stock_threshold integer not null default 5,
  is_available        boolean not null default true,

  -- Offline conflict resolution: last-write-wins on client_updated_at.
  -- A till that was offline for 3 days must not clobber a price the owner
  -- changed on the web dashboard yesterday.
  client_updated_at   timestamptz,
  updated_at          timestamptz not null default now(),
  created_at          timestamptz not null default now(),

  unique (shop_id, product_id)
);
create index shop_products_shop_idx      on shop_products (shop_id);
create index shop_products_product_idx   on shop_products (product_id);
create index shop_products_low_stock_idx on shop_products (shop_id)
  where stock_qty <= low_stock_threshold;
-- Powers GET /v1/shops/{id}/sync?since=
create index shop_products_updated_idx   on shop_products (shop_id, updated_at);

-- Append-only stock ledger. Never UPDATE, never DELETE.
create table stock_movements (
  id           uuid primary key default uuid_generate_v4(),
  shop_id      uuid not null references shops(id) on delete cascade,
  product_id   uuid not null references products(id) on delete restrict,
  delta        integer not null,             -- negative for sales
  reason       stock_reason not null,
  ref_type     text,                         -- 'sale' | 'order' | 'manual'
  ref_id       uuid,
  actor_id     uuid references profiles(id) on delete set null,
  note         text,
  occurred_at  timestamptz not null,         -- CLIENT time (when it happened at the till)
  recorded_at  timestamptz not null default now()  -- SERVER time (when we heard about it)
);
create index stock_movements_shop_idx on stock_movements (shop_id, occurred_at desc);
create index stock_movements_ref_idx  on stock_movements (ref_type, ref_id);

-- =============================================================================
-- POS / SALES
--
-- OFFLINE CONTRACT: the till generates client_sale_id (uuid) at the moment of
-- sale and keeps it forever. Replaying the same batch N times produces exactly
-- one sale row. This is the whole of "offline support" on the server side.
-- =============================================================================

create table sales (
  id                    uuid primary key default uuid_generate_v4(),
  shop_id               uuid not null references shops(id) on delete cascade,
  client_sale_id        uuid not null,          -- generated on the device
  cashier_id            uuid references profiles(id) on delete set null,

  subtotal_cents        bigint not null check (subtotal_cents >= 0),
  discount_cents        bigint not null default 0 check (discount_cents >= 0),
  total_cents           bigint not null check (total_cents >= 0),
  amount_tendered_cents bigint check (amount_tendered_cents >= 0),
  change_cents          bigint check (change_cents >= 0),
  payment_method        payment_method not null default 'cash',
  status                sale_status not null default 'completed',

  sold_at               timestamptz not null,   -- client clock, when the sale happened
  synced_at             timestamptz not null default now(),
  created_at            timestamptz not null default now(),

  -- THE idempotency guarantee.
  unique (shop_id, client_sale_id)
);
create index sales_shop_date_idx on sales (shop_id, sold_at desc);

create table sale_items (
  id               uuid primary key default uuid_generate_v4(),
  sale_id          uuid not null references sales(id) on delete cascade,
  product_id       uuid not null references products(id) on delete restrict,
  product_name     text not null,               -- denormalised: receipts must not change when catalog does
  qty              integer not null check (qty > 0),
  unit_price_cents bigint  not null check (unit_price_cents >= 0),
  line_total_cents bigint  not null check (line_total_cents >= 0)
);
create index sale_items_sale_idx on sale_items (sale_id);

-- =============================================================================
-- MARKETPLACE ORDERS
--
-- An order spans MULTIPLE shops (the multi-shop basket requirement). Each shop
-- accepts/rejects its own leg independently, hence order_shops.
-- =============================================================================

create table orders (
  id                 uuid primary key default uuid_generate_v4(),
  order_number       text unique not null,       -- human-readable, e.g. 'SK-8F3K2P'
  customer_id        uuid not null references profiles(id) on delete restrict,

  status             order_status not null default 'placed',
  fulfilment_type    fulfilment_type not null,

  -- Destination. Deliberately NOT exposed to the customer app after dispatch
  -- alongside courier position — see docs/API_CONTRACT.md § Route privacy.
  dropoff_lat        double precision,
  dropoff_lng        double precision,
  dropoff_address    text,
  dropoff_notes      text,

  subtotal_cents     bigint not null default 0,
  service_fee_cents  bigint not null default 0,
  delivery_fee_cents bigint not null default 0,
  total_cents        bigint not null default 0,

  -- Snapshot of the quote inputs so a fee dispute is answerable later.
  quote_shop_count   integer,
  quote_max_radius_m integer,

  placed_at          timestamptz not null default now(),
  completed_at       timestamptz,
  cancelled_at       timestamptz,
  cancellation_reason text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index orders_customer_idx on orders (customer_id, placed_at desc);
create index orders_status_idx   on orders (status);

create table order_shops (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references orders(id) on delete cascade,
  shop_id        uuid not null references shops(id) on delete restrict,
  status         order_shop_status not null default 'pending',
  subtotal_cents bigint not null default 0,
  distance_m     integer,                        -- shop -> dropoff, at quote time
  rejected_reason text,
  accepted_at    timestamptz,
  ready_at       timestamptz,
  updated_at     timestamptz not null default now(),
  unique (order_id, shop_id)
);
create index order_shops_shop_idx on order_shops (shop_id, status);

create table order_items (
  id               uuid primary key default uuid_generate_v4(),
  order_shop_id    uuid not null references order_shops(id) on delete cascade,
  product_id       uuid not null references products(id) on delete restrict,
  product_name     text not null,
  qty              integer not null check (qty > 0),
  unit_price_cents bigint  not null check (unit_price_cents >= 0),
  line_total_cents bigint  not null check (line_total_cents >= 0),
  -- If a shop is out of stock it substitutes or short-ships rather than
  -- failing the whole order.
  fulfilled_qty    integer
);
create index order_items_order_shop_idx on order_items (order_shop_id);

-- =============================================================================
-- FLYERS  (advertising-only shops — the low-friction v1 onboarding path)
-- =============================================================================

create table flyers (
  id         uuid primary key default uuid_generate_v4(),
  shop_id    uuid not null references shops(id) on delete cascade,
  title      text not null,
  image_url  text not null,                    -- Cloudflare R2
  starts_at  date not null,
  ends_at    date not null,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  constraint flyers_valid_window check (ends_at >= starts_at)
);
create index flyers_shop_idx   on flyers (shop_id);
create index flyers_active_idx on flyers (is_active, starts_at, ends_at);

-- =============================================================================
-- DELIVERY  (v2 — tables exist so the contract is stable; endpoints are STUB)
-- =============================================================================

create table couriers (
  id             uuid primary key references profiles(id) on delete cascade,
  mode           courier_mode not null,
  max_radius_m   integer not null default 2000,   -- foot/bicycle ~2km
  is_online      boolean not null default false,
  vehicle_reg    text,
  id_doc_url     text,
  is_verified    boolean not null default false,
  rating_avg     numeric(2,1),
  created_at     timestamptz not null default now()
);

create table deliveries (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null unique references orders(id) on delete cascade,
  courier_id      uuid references couriers(id) on delete set null,
  mode            courier_mode,
  status          delivery_status not null default 'unassigned',
  payout_cents    bigint not null default 0,
  assigned_at     timestamptz,
  collected_at    timestamptz,
  delivered_at    timestamptz,
  proof_photo_url text,
  created_at      timestamptz not null default now()
);
create index deliveries_courier_idx on deliveries (courier_id, status);

-- Courier position log. NEVER served to the customer. See § Route privacy.
create table delivery_positions (
  id          bigserial primary key,
  delivery_id uuid not null references deliveries(id) on delete cascade,
  lat         double precision not null,
  lng         double precision not null,
  recorded_at timestamptz not null default now()
);
create index delivery_positions_idx on delivery_positions (delivery_id, recorded_at desc);
comment on table delivery_positions is
  'Internal only. Exposed to admin + the assigned courier. NEVER returned on any customer-facing endpoint — displaying a courier route in a township is an armed-robbery vector.';

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Powers GET /v1/search/products (price comparison + average price).
-- Only products with a barcode participate: shop-local items are not comparable.
create view v_product_offers as
select
  p.id            as product_id,
  p.barcode,
  p.name          as product_name,
  p.brand,
  p.unit_size,
  p.image_url,
  sp.id           as shop_product_id,
  sp.price_cents,
  sp.stock_qty,
  sp.is_available,
  s.id            as shop_id,
  s.name          as shop_name,
  s.lat           as shop_lat,
  s.lng           as shop_lng,
  s.accepts_orders,
  s.is_active
from products p
join shop_products sp on sp.product_id = p.id
join shops s          on s.id = sp.shop_id
where p.barcode is not null
  and s.is_active
  and sp.is_available;

create view v_product_price_stats as
select
  product_id,
  count(*)                              as offer_count,
  round(avg(price_cents))::bigint       as avg_price_cents,
  min(price_cents)                      as min_price_cents,
  max(price_cents)                      as max_price_cents
from v_product_offers
group by product_id;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger t_profiles_touch      before update on profiles      for each row execute function touch_updated_at();
create trigger t_shops_touch         before update on shops         for each row execute function touch_updated_at();
create trigger t_products_touch      before update on products      for each row execute function touch_updated_at();
create trigger t_shop_products_touch before update on shop_products for each row execute function touch_updated_at();
create trigger t_orders_touch        before update on orders        for each row execute function touch_updated_at();
create trigger t_order_shops_touch   before update on order_shops   for each row execute function touch_updated_at();

-- Keep the cached stock counter in step with the ledger.
create or replace function apply_stock_movement() returns trigger as $$
begin
  update shop_products
     set stock_qty  = stock_qty + new.delta,
         updated_at = now()
   where shop_id = new.shop_id
     and product_id = new.product_id;
  return new;
end;
$$ language plpgsql;

create trigger t_stock_movement_applies
  after insert on stock_movements
  for each row execute function apply_stock_movement();

-- Auto-create a profile whenever Supabase creates an auth user.
create or replace function handle_new_auth_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'SmartKasi user'),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger t_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- The NestJS API connects with the service role and does its own authorisation,
-- so these policies exist to protect the case where a Flutter client talks to
-- Supabase directly (realtime subscriptions, storage). Do not rely on RLS as
-- the only gate for anything the API also serves.
-- =============================================================================

alter table profiles       enable row level security;
alter table shops          enable row level security;
alter table shop_products  enable row level security;
alter table sales          enable row level security;
alter table orders         enable row level security;
alter table order_shops    enable row level security;
alter table deliveries     enable row level security;
alter table delivery_positions enable row level security;

create policy "own profile" on profiles
  for all using (auth.uid() = id);

create policy "shops are publicly readable" on shops
  for select using (is_active);

create policy "owner manages own shop" on shops
  for all using (owner_id = auth.uid());

create policy "inventory publicly readable" on shop_products
  for select using (true);

create policy "shop staff manage inventory" on shop_products
  for all using (
    exists (select 1 from shops s where s.id = shop_products.shop_id and s.owner_id = auth.uid())
    or exists (select 1 from shop_staff ss where ss.shop_id = shop_products.shop_id and ss.user_id = auth.uid())
  );

create policy "shop reads own sales" on sales
  for all using (
    exists (select 1 from shops s where s.id = sales.shop_id and s.owner_id = auth.uid())
    or exists (select 1 from shop_staff ss where ss.shop_id = sales.shop_id and ss.user_id = auth.uid())
  );

create policy "customer reads own orders" on orders
  for select using (customer_id = auth.uid());

create policy "shop reads its order legs" on order_shops
  for select using (
    exists (select 1 from shops s where s.id = order_shops.shop_id and s.owner_id = auth.uid())
  );

-- Customer may read the delivery row (status only — the API strips courier
-- identity and position). No policy grants customers delivery_positions.
create policy "customer reads own delivery" on deliveries
  for select using (
    exists (select 1 from orders o where o.id = deliveries.order_id and o.customer_id = auth.uid())
  );

create policy "courier reads own positions" on delivery_positions
  for all using (
    exists (select 1 from deliveries d where d.id = delivery_positions.delivery_id and d.courier_id = auth.uid())
  );
