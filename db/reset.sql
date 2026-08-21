-- =============================================================================
-- SmartKasi — demo data reset
--
-- DESTRUCTIVE. Empties every application table and deletes the five demo auth
-- users. Intended for a demo/staging project whose only contents are seed data.
--
-- There is deliberately no `npm run db:reset` alias. Run it explicitly:
--
--   cd apps/api
--   node scripts/sql.mjs -f ../../db/reset.sql
--   npm run db:users
--   npm run db:seed
--
-- Order matters: shops.owner_id references profiles ON DELETE RESTRICT, so the
-- public tables have to go before the auth users. `truncate ... cascade` also
-- skips the row triggers, which is what keeps the stock ledger from firing on
-- the way down.
-- =============================================================================

truncate order_items, order_shops, orders, deliveries, delivery_positions,
         sale_items, sales, stock_movements, shop_products, flyers,
         shop_staff, shops, products, categories, couriers, profiles
         restart identity cascade;

delete from auth.identities
 where user_id in (select id from auth.users where email like '%@smartkasi.test');
delete from auth.users where email like '%@smartkasi.test';
