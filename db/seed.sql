-- =============================================================================
-- SmartKasi — demo seed data
--
-- Run AFTER schema.sql. Safe to re-run (idempotent on fixed UUIDs).
--
-- Creates: 3 shops in Soweto, 12 real SA grocery products, overlapping
-- inventory at DIFFERENT prices (so price comparison has something to show),
-- one multi-shop order, and a week of POS sales.
--
-- NOTE ON USERS: profiles.id references auth.users. Create the auth users in
-- Supabase first (Auth > Users, or the admin API) with these exact UUIDs, or
-- run the block at the bottom which inserts directly into auth.users for local
-- development only.
-- =============================================================================

begin;

-- --- Auth users --------------------------------------------------------------
-- COMMENTED OUT: this project is a hosted Supabase project, so the five demo
-- users are created through GoTrue instead — `npm run db:users` in apps/api,
-- which calls the Admin API with these exact UUIDs. Writing auth.users by hand
-- leaves its token columns NULL, and such a row signs in once then fails on
-- refresh. Uncomment the block below only for a throwaway local database.
-- insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
--                         email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
--                         created_at, updated_at)
-- values
--   ('11111111-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
--    'authenticated', 'authenticated', 'thoko@smartkasi.test',
--    crypt('Password123!', gen_salt('bf')), now(),
--    '{"provider":"email","providers":["email"],"role":"shop_owner"}',
--    '{"full_name":"Thoko Ndlovu"}', now(), now()),
--   ('11111111-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
--    'authenticated', 'authenticated', 'sipho@smartkasi.test',
--    crypt('Password123!', gen_salt('bf')), now(),
--    '{"provider":"email","providers":["email"],"role":"shop_owner"}',
--    '{"full_name":"Sipho Dlamini"}', now(), now()),
--   ('11111111-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
--    'authenticated', 'authenticated', 'naledi@smartkasi.test',
--    crypt('Password123!', gen_salt('bf')), now(),
--    '{"provider":"email","providers":["email"],"role":"shop_owner"}',
--    '{"full_name":"Naledi Khumalo"}', now(), now()),
--   ('22222222-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
--    'authenticated', 'authenticated', 'customer@smartkasi.test',
--    crypt('Password123!', gen_salt('bf')), now(),
--    '{"provider":"email","providers":["email"],"role":"customer"}',
--    '{"full_name":"Lerato Mokoena"}', now(), now()),
--   ('33333333-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
--    'authenticated', 'authenticated', 'courier@smartkasi.test',
--    crypt('Password123!', gen_salt('bf')), now(),
--    '{"provider":"email","providers":["email"],"role":"courier"}',
--    '{"full_name":"Thabo Mahlangu"}', now(), now())
-- on conflict (id) do nothing;

-- The auth trigger creates profiles; set roles and details explicitly.
-- Since 20260824000001_role_claim_sync, handle_new_auth_user() already takes the
-- role from the app_metadata that seed-users.mjs sends, so these role values are
-- normally a no-op. They are kept because this file must also work against a
-- database seeded some other way — and because they now flow back out to the JWT
-- through t_profiles_role_to_auth, which is worth exercising on every seed.
update profiles set role = 'shop_owner', full_name = 'Thoko Ndlovu',  phone = '+27821234567' where id = '11111111-0000-4000-8000-000000000001';
update profiles set role = 'shop_owner', full_name = 'Sipho Dlamini', phone = '+27821234568' where id = '11111111-0000-4000-8000-000000000002';
update profiles set role = 'shop_owner', full_name = 'Naledi Khumalo',phone = '+27821234569' where id = '11111111-0000-4000-8000-000000000003';
update profiles set role = 'courier',    full_name = 'Thabo Mahlangu',phone = '+27821234570' where id = '33333333-0000-4000-8000-000000000003';
update profiles
   set role = 'customer', full_name = 'Lerato Mokoena', phone = '+27821234571',
       home_address = '77 Mooki St, Orlando East',
       home_lat = -26.2461, home_lng = 27.9212
 where id = '22222222-0000-4000-8000-000000000002';

-- --- Categories --------------------------------------------------------------
insert into categories (id, name) values
  ('9a1b0000-0000-4000-8000-000000000001', 'Staples'),
  ('9a1b0000-0000-4000-8000-000000000002', 'Beverages'),
  ('9a1b0000-0000-4000-8000-000000000003', 'Household'),
  ('9a1b0000-0000-4000-8000-000000000004', 'Snacks'),
  ('9a1b0000-0000-4000-8000-000000000005', 'Tinned goods'),
  ('9a1b0000-0000-4000-8000-000000000006', 'Dairy')
on conflict (id) do nothing;

-- --- Shops -------------------------------------------------------------------
-- Note the mix: two verified full-mode shops (can take orders) and one
-- advertising_only shop with no licence — that is the realistic onboarding
-- spread, and it exercises the accepts_orders gate.
insert into shops (id, owner_id, name, slug, description, phone, lat, lng, address_line,
                   township, city, province, trading_licence_no, licence_status,
                   mode, accepts_orders, accepts_delivery, opens_at, closes_at)
values
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '11111111-0000-4000-8000-000000000001',
   'Mama Thoko''s Tuckshop', 'mama-thokos-tuckshop',
   'Groceries, airtime and fresh bread daily.', '+27821234567',
   -26.2380, 27.9083, '1423 Vilakazi St',
   'Orlando West', 'Soweto', 'Gauteng', 'GP/SOW/2026/00841', 'verified',
   'full', true, true, '07:00', '20:00'),

  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '11111111-0000-4000-8000-000000000002',
   'Bra Sipho Spaza', 'bra-sipho-spaza',
   'Open late. Cold drinks and cigarettes.', '+27821234568',
   -26.2461, 27.9212, '88 Mooki St',
   'Orlando East', 'Soweto', 'Gauteng', 'GP/SOW/2026/00912', 'verified',
   'full', true, false, '06:00', '22:00'),

  ('7b0e1c2a-3333-4a3b-9c11-cccccccccccc', '11111111-0000-4000-8000-000000000003',
   'Kasi Fresh Mini Market', 'kasi-fresh-mini-market',
   'Weekly specials. Bulk buys.', '+27821234569',
   -26.2520, 27.9350, '5 Chris Hani Rd',
   'Diepkloof', 'Soweto', 'Gauteng', null, 'none',
   'advertising_only', false, false, '08:00', '18:00')
on conflict (id) do nothing;

-- --- Products (real SA grocery items, real-ish barcodes) ---------------------
insert into products (id, barcode, name, brand, unit_size, category_id, is_verified) values
  ('3f0a9d10-aaaa-4c11-9999-111111111111', '6001068000456', 'Iwisa Super Maize Meal',      'Iwisa',      '5kg',       '9a1b0000-0000-4000-8000-000000000001', true),
  ('3f0a9d10-bbbb-4c11-9999-222222222222', '6001087001234', 'Sunlight Bar Soap',           'Sunlight',   '250g',      '9a1b0000-0000-4000-8000-000000000003', true),
  ('3f0a9d10-cccc-4c11-9999-333333333333', '6001087005678', 'Sunlight Dishwashing Liquid', 'Sunlight',   '750ml',     '9a1b0000-0000-4000-8000-000000000003', true),
  ('3f0a9d10-dddd-4c11-9999-444444444444', '6009510800012', 'Koo Chakalaka Mild',          'Koo',        '410g',      '9a1b0000-0000-4000-8000-000000000005', true),
  ('3f0a9d10-eeee-4c11-9999-555555555555', '5449000000996', 'Coca-Cola',                   'Coca-Cola',  '2L',        '9a1b0000-0000-4000-8000-000000000002', true),
  ('3f0a9d10-ffff-4c11-9999-666666666666', '6001240100011', 'Clover Fresh Milk',           'Clover',     '1L',        '9a1b0000-0000-4000-8000-000000000006', true),
  ('3f0a9d10-a1a1-4c11-9999-777777777777', '6001275000019', 'Albany Superior White Bread', 'Albany',     '700g',      '9a1b0000-0000-4000-8000-000000000001', true),
  ('3f0a9d10-b2b2-4c11-9999-888888888888', '6009522800045', 'Lucky Star Pilchards in Tomato Sauce', 'Lucky Star', '400g', '9a1b0000-0000-4000-8000-000000000005', true),
  ('3f0a9d10-c3c3-4c11-9999-999999999999', '6001056000024', 'Joko Tagless Teabags',        'Joko',       '100s',      '9a1b0000-0000-4000-8000-000000000002', true),
  ('3f0a9d10-d4d4-4c11-9999-aaaaaaaaaaaa', '6001229000107', 'Simba Chips Salt & Vinegar',  'Simba',      '125g',      '9a1b0000-0000-4000-8000-000000000004', true),
  ('3f0a9d10-e5e5-4c11-9999-bbbbbbbbbbbb', '6001362000015', 'Huletts White Sugar',         'Huletts',    '2.5kg',     '9a1b0000-0000-4000-8000-000000000001', true),
  ('3f0a9d10-f6f6-4c11-9999-cccccccccccc', '6001445000053', 'Sunflower Cooking Oil',       'Sunfoil',    '2L',        '9a1b0000-0000-4000-8000-000000000001', true)
on conflict (id) do nothing;

-- A shop-local item with no barcode — proves it is excluded from comparison.
insert into products (id, barcode, name, brand, unit_size, category_id, created_by_shop_id, is_verified)
values ('3f0a9d10-0707-4c11-9999-dddddddddddd', null, 'Kota (full house)', null, 'each',
        '9a1b0000-0000-4000-8000-000000000004', '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', false)
on conflict (id) do nothing;

-- --- Inventory ---------------------------------------------------------------
-- Deliberately overlapping products at DIFFERENT prices across the three shops,
-- so GET /search/products has a real spread to compare. One item is set below
-- its threshold so the low-stock alert has something to fire on.
insert into shop_products (shop_id, product_id, price_cents, cost_cents, stock_qty, low_stock_threshold) values
  -- Mama Thoko's — cheapest on staples
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-aaaa-4c11-9999-111111111111',  8500,  7400, 14,  5),
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-bbbb-4c11-9999-222222222222',   725,   580, 40, 10),
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-eeee-4c11-9999-555555555555',  2599,  2100, 22,  6),
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-ffff-4c11-9999-666666666666',  2150,  1800,  3,  6),  -- LOW STOCK
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-a1a1-4c11-9999-777777777777',  1899,  1550, 12,  8),
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-b2b2-4c11-9999-888888888888',  2899,  2400, 18,  6),
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-e5e5-4c11-9999-bbbbbbbbbbbb',  4999,  4300,  9,  4),
  ('7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', '3f0a9d10-0707-4c11-9999-dddddddddddd',  3500,  2200, 99, 10),

  -- Bra Sipho — mid prices, open late
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-aaaa-4c11-9999-111111111111',  8800,  7400,  6,  5),
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-cccc-4c11-9999-333333333333',  3299,  2700,  0,  4),  -- OUT OF STOCK
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-dddd-4c11-9999-444444444444',  2199,  1750, 24,  6),
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-eeee-4c11-9999-555555555555',  2799,  2100, 30,  8),
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-c3c3-4c11-9999-999999999999',  6499,  5600, 11,  4),
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-d4d4-4c11-9999-aaaaaaaaaaaa',  1699,  1300, 45, 12),
  ('7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', '3f0a9d10-f6f6-4c11-9999-cccccccccccc',  9999,  8700,  7,  3),

  -- Kasi Fresh — bulk, dearest per unit, advertising-only so no orders
  ('7b0e1c2a-3333-4a3b-9c11-cccccccccccc', '3f0a9d10-aaaa-4c11-9999-111111111111',  8999,  7400, 40,  10),
  ('7b0e1c2a-3333-4a3b-9c11-cccccccccccc', '3f0a9d10-dddd-4c11-9999-444444444444',  2450,  1750, 60,  15),
  ('7b0e1c2a-3333-4a3b-9c11-cccccccccccc', '3f0a9d10-e5e5-4c11-9999-bbbbbbbbbbbb',  5299,  4300, 25,   8),
  ('7b0e1c2a-3333-4a3b-9c11-cccccccccccc', '3f0a9d10-f6f6-4c11-9999-cccccccccccc', 10499,  8700, 15,   5),
  ('7b0e1c2a-3333-4a3b-9c11-cccccccccccc', '3f0a9d10-b2b2-4c11-9999-888888888888',  3099,  2400, 33,  10)
on conflict (shop_id, product_id) do nothing;

-- --- Flyers (the advertising-only value proposition) -------------------------
insert into flyers (id, shop_id, title, image_url, starts_at, ends_at) values
  ('f1000000-0000-4000-8000-000000000001', '7b0e1c2a-3333-4a3b-9c11-cccccccccccc',
   'Month-end specials', 'https://cdn.smartkasi.co.za/flyers/kasi-fresh-aug.jpg',
   current_date - 2, current_date + 7),
  ('f1000000-0000-4000-8000-000000000002', '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa',
   'Fresh bread every morning', 'https://cdn.smartkasi.co.za/flyers/thoko-bread.jpg',
   current_date, current_date + 30)
on conflict (id) do nothing;

-- --- POS sales history -------------------------------------------------------
-- Enough to make the daily report and top-products list non-empty.
do $$
declare
  v_shop uuid := '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa';
  v_cashier uuid := '11111111-0000-4000-8000-000000000001';
  v_sale uuid;
  v_day int;
  v_n int;
  v_prod uuid;
  v_price bigint;
  v_qty int;
  v_total bigint;
  v_products uuid[] := array[
    '3f0a9d10-aaaa-4c11-9999-111111111111',
    '3f0a9d10-bbbb-4c11-9999-222222222222',
    '3f0a9d10-eeee-4c11-9999-555555555555',
    '3f0a9d10-a1a1-4c11-9999-777777777777',
    '3f0a9d10-b2b2-4c11-9999-888888888888'
  ];
begin
  -- Idempotency guard. Sale ids are generated, so 'on conflict' cannot save us:
  -- a second run would silently double the week's takings and, worse, the
  -- restock below would then over-credit stock and hide the low-stock items.
  if exists (select 1 from sales where shop_id = v_shop) then
    raise notice 'sales history already seeded - skipping';
    return;
  end if;

  for v_day in 0..6 loop
    for v_n in 1..8 loop
      v_prod  := v_products[1 + (v_n + v_day) % 5];
      select price_cents into v_price from shop_products
        where shop_id = v_shop and product_id = v_prod;
      v_qty   := 1 + (v_n % 3);
      v_total := v_price * v_qty;
      v_sale  := uuid_generate_v4();

      insert into sales (id, shop_id, client_sale_id, cashier_id, subtotal_cents,
                         discount_cents, total_cents, amount_tendered_cents,
                         change_cents, payment_method, sold_at)
      values (v_sale, v_shop, uuid_generate_v4(), v_cashier, v_total, 0, v_total,
              ceil(v_total / 5000.0) * 5000,
              (ceil(v_total / 5000.0) * 5000) - v_total,
              case when v_n % 7 = 0 then 'card'::payment_method else 'cash'::payment_method end,
              (current_date - v_day) + time '08:00' + (v_n * interval '73 minutes'));

      insert into sale_items (sale_id, product_id, product_name, qty, unit_price_cents, line_total_cents)
      select v_sale, v_prod, p.name, v_qty, v_price, v_total from products p where p.id = v_prod;

      insert into stock_movements (shop_id, product_id, delta, reason, ref_type, ref_id, actor_id, occurred_at)
      values (v_shop, v_prod, -v_qty, 'sale', 'sale', v_sale, v_cashier,
              (current_date - v_day) + time '08:00' + (v_n * interval '73 minutes'));
    end loop;
  end loop;
end $$;

-- The seeded sales history above drove stock down through the ledger (as it
-- should). Restock by exactly what was sold, so the demo opens with believable
-- numbers and the low-stock list shows only the two items we deliberately set
-- low -- not every product that appeared in a sale.
insert into stock_movements (shop_id, product_id, delta, reason, ref_type, occurred_at, note)
select s.shop_id, si.product_id, sum(si.qty), 'restock', 'manual', now(), 'seed restock'
  from sale_items si
  join sales s on s.id = si.sale_id
 group by s.shop_id, si.product_id
 having not exists (select 1 from stock_movements where note = 'seed restock');

-- --- One multi-shop order in a partially-accepted state ----------------------
insert into orders (id, order_number, customer_id, status, fulfilment_type,
                    dropoff_lat, dropoff_lng, dropoff_address, dropoff_notes,
                    subtotal_cents, service_fee_cents, delivery_fee_cents, total_cents,
                    quote_shop_count, quote_max_radius_m)
values ('88888888-8888-4888-8888-888888888888', 'SK-8F3K2P',
        '22222222-0000-4000-8000-000000000002', 'partially_accepted', 'delivery',
        -26.2461, 27.9212, '77 Mooki St, Orlando East',
        'Blue gate, next to the tuckshop',
        17450, 1800, 0, 19250, 2, 1620)
on conflict (id) do nothing;

insert into order_shops (id, order_id, shop_id, status, subtotal_cents, distance_m, accepted_at) values
  ('55555555-0000-4000-8000-000000000001', '88888888-8888-4888-8888-888888888888',
   '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa', 'accepted', 8500, 480, now()),
  ('55555555-0000-4000-8000-000000000002', '88888888-8888-4888-8888-888888888888',
   '7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb', 'rejected', 8950, 1620, null)
on conflict (id) do nothing;

update order_shops set rejected_reason = 'out_of_stock'
 where id = '55555555-0000-4000-8000-000000000002';

insert into order_items (id, order_shop_id, product_id, product_name, qty, unit_price_cents, line_total_cents, fulfilled_qty)
values ('66666666-0000-4000-8000-000000000001', '55555555-0000-4000-8000-000000000001',
        '3f0a9d10-aaaa-4c11-9999-111111111111', 'Iwisa Super Maize Meal', 1, 8500, 8500, 1)
on conflict (id) do nothing;

-- --- Courier -----------------------------------------------------------------
insert into couriers (id, mode, max_radius_m, is_online, is_verified, rating_avg)
values ('33333333-0000-4000-8000-000000000003', 'bicycle', 2000, true, true, 4.8)
on conflict (id) do nothing;

commit;

-- =============================================================================
-- Sanity checks — run these after seeding
-- =============================================================================
-- select name, licence_status, accepts_orders from shops;
-- select * from v_product_price_stats order by offer_count desc;
-- select p.name, sp.price_cents, s.name from shop_products sp
--   join products p on p.id = sp.product_id join shops s on s.id = sp.shop_id
--   where p.barcode = '6001068000456' order by sp.price_cents;
-- select count(*), sum(total_cents) from sales where sold_at::date = current_date;
