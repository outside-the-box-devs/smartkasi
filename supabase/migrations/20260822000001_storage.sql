-- =============================================================================
-- SmartKasi — Supabase-only objects (storage)
-- DB tables are owned by Prisma (apps/api/prisma/migrations). This file must
-- NOT create enums, tables, or anything in public.* — only storage, auth
-- helpers, and other Supabase-managed schemas.
--
-- Generated: 2026-08-22 — replaces the previous DB mirror migration
-- (20260821123132_init_smartkasi.sql) which is now archived and handled by
-- Prisma. See AGENTS.md §1.
-- =============================================================================

-- Storage buckets for SmartKasi
-- Supabase local creates storage.buckets on first start; this migration makes
-- the app's expected buckets explicit and idempotent for both local and remote.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',         'avatars',         true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('shop-logos',      'shop-logos',      true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('flyers',          'flyers',          true,  10485760, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('licence-docs',    'licence-docs',    false, 10485760, array['image/jpeg','image/png','application/pdf']),
  ('delivery-proofs', 'delivery-proofs', false, 5242880,  array['image/jpeg','image/png'])
on conflict (id) do nothing;

-- RLS helpers for storage.objects
-- Supabase enables RLS on storage.objects by default. Default policies on a
-- fresh project are restrictive; these demo policies mirror what the app
-- expects: public buckets are world-readable, authenticated users can upload,
-- and owners manage their own objects. All CREATE POLICY are idempotent via
-- the DO block.

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Public buckets are publicly readable'
  ) then
    create policy "Public buckets are publicly readable"
      on storage.objects for select
      using (bucket_id in ('avatars','shop-logos','flyers'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Authenticated can upload to public buckets'
  ) then
    create policy "Authenticated can upload to public buckets"
      on storage.objects for insert
      with check (
        bucket_id in ('avatars','shop-logos','flyers')
        and auth.role() = 'authenticated'
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Service role can manage private buckets'
  ) then
    create policy "Service role can manage private buckets"
      on storage.objects for all
      using (bucket_id in ('licence-docs','delivery-proofs') and auth.role() = 'service_role')
      with check (bucket_id in ('licence-docs','delivery-proofs') and auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Owners can manage own objects'
  ) then
    create policy "Owners can manage own objects"
      on storage.objects for all
      using (auth.uid() = owner)
      with check (auth.uid() = owner);
  end if;
end $$;
