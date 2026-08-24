# Supabase — Local & Storage Setup (SmartKasi)

> **Agent note:** This is scoped to Supabase-only objects. DB tables are owned by Prisma. See `AGENTS.md:1`.

## What lives here

- `supabase/migrations/20260822000001_storage.sql:1` — **Supabase-only** migration (storage buckets `avatars`, `shop-logos`, `flyers`, `licence-docs`, `delivery-proofs` + `storage.objects` policies). Applied by `supabase db reset` to the local Postgres at `supabase/config.toml:35` `54322`. Never add `public.*` tables/enums here.
- `supabase/migrations/archive/20260821123132_init_smartkasi.sql:1` — archived former DB mirror (verbatim copy of `db/schema.sql`, 25872 bytes). Now owned by `apps/api/prisma/migrations/20260822000001_init/migration.sql:1`. Do not re-apply.
- `supabase/seed.sql:1` — Supabase-only placeholder (1-line `select`). DB demo data is seeded via `apps/api/prisma/seed.ts:1` → `db/seed.sql:1` after `apps/api/scripts/seed-users.mjs:1` creates auth users. `supabase/config.toml:66-71` has `[db.seed] enabled = false` so `supabase start` cannot FK-violate on `shops_owner_id_fkey`.
- `supabase/config.toml:59-71` — `[db.migrations] enabled=true` (storage migrations), `[db.seed] enabled=false` (DB seed via Prisma). `experimental.pgdelta.enabled=true` for `db diff`.

## Why Prisma owns the DB

Before 2026-08-22, `supabase/migrations/20260821123132_init_smartkasi.sql` was a verbatim copy of `db/schema.sql` and `supabase/seed.sql` was a verbatim copy of `db/seed.sql`. `supabase start` created all `public.*` tables via Supabase, then tried to seed `shops` before `profiles` existed (profiles come from `auth.users` trigger, whose `insert into auth.users` block was commented out for hosted use). Result:

```
failed to send batch: ERROR: insert or update on table "shops" violates foreign key constraint "shops_owner_id_fkey"
Pruned containers: [supabase_db_SmartKasi]  # DB destroyed on failure
```

Fix 2026-08-22: DB moved to Prisma (`prisma/migrations/20260822000001_init` holds full schema incl. `uuid-ossp` + `pg_trgm`, enums, triggers `443-490`, RLS `500-552`, views `403-439`). Supabase migrations now handle **only** storage buckets + policies. Seeding is two-phase: `supabase start` (storage only) → `prisma migrate deploy` → `seed-users.mjs` (GoTrue) → `prisma db seed`. See `AGENTS.md:2`.

## Commands

```powershell
# Supabase storage only (DB is empty until Prisma runs)
npm run supabase:reset   # = npx supabase db reset (applies storage migration only)
npm run supabase:status  # check DB 54322, API 54321, Studio 54323, Inbucket 54324
npm run supabase:migration:new  # npx supabase migration new <name> — Supabase-only delta
npm run supabase:diff    # npx supabase db diff -f <name> — needs Docker + running stack
```

Requires Docker Desktop. Without it `migration list --local` returns `dial ECONNREFUSED 127.0.0.1:54322` — expected, but migration file must still be non-empty.

For full DB setup after Supabase start:

```powershell
cd apps/api
npx prisma migrate deploy  # or npx prisma migrate dev --name <feature> during development
npm run db:users           # creates 5 auth.users with fixed UUIDs via GoTrue
npx prisma db seed         # applies db/seed.sql via pg (idempotent)
# or: npm run db:setup  (= deploy + users + seed)
```

## Adding a migration

### A. DB change (Prisma)

```powershell
code apps/api/prisma/schema.prisma
npx supabase start                  # needs storage buckets, DB empty
cd apps/api
npx prisma migrate dev --name add_<feature>   # review generated migration.sql, add raw SQL for triggers/RLS if needed
# Mirror the delta by hand into db/schema.sql. Copy-Item is only correct for the INITIAL migration;
# for a delta it truncates the full-schema file down to that delta.
npx prisma generate
```

Never `supabase migration new` for DB objects.

### B. Supabase-only change (storage/auth)

```powershell
npx supabase migration new add_<storage_feature>   # storage only!
# Edit supabase/migrations/<ts>_add_<storage_feature>.sql — ONLY storage/auth objects
npx supabase db reset
```

Do **not** touch Prisma for storage-only changes. Do **not** copy to `db/schema.sql`.

## Verify

```powershell
Get-ChildItem supabase/migrations/*.sql | Select Name, Length  # expect 20260822000001_storage.sql
Get-Content supabase/migrations/20260822000001_storage.sql | Select-String "storage.buckets"  # must exist
Get-Content supabase/seed.sql | Select-String "Prisma"  # must mention Prisma, must NOT contain "insert into shops"
Select-String supabase/config.toml -Pattern "enabled = false" -Context 2  # db.seed false
Get-ChildItem apps/api/prisma/migrations -Recurse -Filter migration.sql | Select FullName, Length  # expect 20260822000001_init 25872 + 20260824000001_role_claim_sync
npx supabase start    # should succeed, no FK violation
npx supabase status   # DB 54322, Studio 54323, API 54321
cd apps/api; npx prisma migrate status; npx prisma migrate deploy; npx prisma db seed
```

Full contract: `../AGENTS.md:1` and `../apps/api/prisma/seed.ts:1`.

## Remote divergence

Remote `wndilblmkkdyzpffmwap` (eu-west-1) was populated via `apps/api/scripts/sql.mjs:28` on `DIRECT_URL` (session pooler 5432), not `supabase db push`. `supabase_migrations` table is empty for DB; storage buckets were missing until this fix. After first `supabase link`, `migration repair` is only needed for storage migrations, not Prisma DB migrations (which use `prisma migrate deploy` over `DIRECT_URL`).
