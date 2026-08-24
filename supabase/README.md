# Supabase — Local Migration Setup (SmartKasi)

> **Agent note:** This is a stub that enforces `AGENTS.md:1`. Do not treat `supabase/migrations/` as independently authored.

## What lives here

- `supabase/migrations/20260821123132_init_smartkasi.sql:1` — verbatim copy of `db/schema.sql:1` (28979 bytes). Applied by `supabase db reset` to the local Postgres at `supabase/config.toml:35` `54322`.
- `supabase/seed.sql:1` — verbatim copy of `db/seed.sql:1` (18066 bytes). Loaded via `supabase/config.toml:71` `sql_paths = ["./seed.sql"]`.
- `supabase/config.toml:59-64` — `[db.migrations] enabled=true, schema_paths=[]` (migration-file mode, not declarative `schemas/`). `experimental.pgdelta.enabled=true` for `db diff`.

## Why copies

`db/schema.sql` is canonical because it carries `pg_trgm` (`db/schema.sql:32`), 10 enum types (`db/schema.sql:38-49`), triggers (`db/schema.sql:452-496`), and RLS (`db/schema.sql:501-619`) that Prisma cannot express. Supabase CLI only knows `supabase/migrations/` + `supabase/seed.sql`, so we mirror — single source, two consumers. See `AGENTS.md:3` workflow.

## Commands

```powershell
npm run supabase:reset   # = npx supabase db reset (applies migrations + seed)
npm run supabase:status  # check DB 54322, API 54321, Studio 54323, Inbucket 54324
npm run supabase:migration:new  # npx supabase migration new <name> — add delta file
npm run supabase:diff    # npx supabase db diff -f <name> — needs Docker + running stack
```

Requires Docker Desktop. Without it `migration list --local` returns `dial ECONNREFUSED 127.0.0.1:54322` — that is expected, but the migration file must still be non-empty.

## Adding a migration

```powershell
# 1. Change the source
code ../../db/schema.sql
# 2. Create a new migration with ONLY the delta (not the full schema)
npx supabase migration new add_<feature>
# Edit supabase/migrations/<new_timestamp>_add_<feature>.sql
# 3. Keep source in sync (manual — no automation yet)
# 4. Verify
npx supabase db reset
cd ../apps/api; npx prisma db pull; npx prisma generate
```

Do **not** edit a committed migration in place after it has been pushed to `wndilblmkkdyzpffmwap` (remote eu-west-1) — add a new file. The initial migration `20260821123132` was empty before 2026-08-22; now it is populated and `Get-FileHash` must match `db/schema.sql`.

## Remote divergence

Remote was seeded via `apps/api/scripts/sql.mjs:28` (session pooler 5432), not `supabase db push`. Before first link+push:

```powershell
npx supabase link --project-ref wndilblmkkdyzpffmwap
npx supabase migration repair --status applied 20260821123132
```

Otherwise push fails on `create type user_role` (no `IF NOT EXISTS`).

## Verify

```powershell
Get-Item supabase/migrations/20260821123132*.sql | Select Length  # 28979
Get-Item supabase/seed.sql | Select Length                         # 18066
Get-FileHash ../../db/schema.sql; Get-FileHash supabase/migrations/20260821123132*.sql
```

Full contract: `../AGENTS.md:1`.
