-- =============================================================================
-- SmartKasi — Supabase seed (Supabase-only)
-- =============================================================================
--
-- DB seeding (profiles, shops, products, orders, sales) is handled by Prisma:
--
--   cd apps/api
--   npx prisma migrate deploy   # creates tables (incl. triggers, RLS, views)
--   npm run db:users            # creates 5 auth.users via GoTrue Admin API
--   npx prisma db seed          # or: npm run db:seed (runs prisma/seed.ts -> db/seed.sql)
--
-- This file is intentionally minimal so `supabase start` / `supabase db reset`
-- never hits FK violations like shops_owner_id_fkey (which happened 2026-08-22
-- when this file was a verbatim copy of db/seed.sql and tried to UPDATE
-- non-existent profiles / INSERT shops before auth.users existed).
--
-- Keep Supabase seed for Supabase-only data (e.g. storage.objects demo rows)
-- and leave public.* demo data to Prisma. See supabase/config.toml:66-71
-- (enabled = false) and AGENTS.md §1.
-- =============================================================================

-- No public.* inserts here. Storage buckets are seeded via
-- supabase/migrations/20260822000001_storage.sql (idempotent inserts).
-- If you need local storage demo objects, add them here with
-- `insert into storage.objects ...` — never insert into shops/profiles.

select 'supabase seed: db seeding handled by Prisma — nothing to do' as status;
