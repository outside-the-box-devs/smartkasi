# Supabase — local stack and storage

**Supabase owns auth and storage on this project. It does not own the database
schema.** Every `public.*` table, enum, view, trigger and RLS policy belongs to
Prisma, in `apps/api/prisma/`.

The contract is [`AGENTS.md`](../AGENTS.md) at the repo root. Read it before
changing anything in this directory. This file explains what actually lives
here, why so little of it does, and how to run the local stack.

## What is in this directory

| Path | What it is |
|---|---|
| `config.toml` | The local stack: API 54321, DB 54322, Studio 54323, mail 54324. Postgres major version 17. |
| `migrations/20260822000001_storage.sql` | The **only** live migration here. Five `storage.buckets` rows and four `storage.objects` policies. 3,479 bytes. |
| `migrations/archive/20260821123132_init_smartkasi.sql` | The former DB mirror — a copy of `db/schema.sql` as it stood on 21 Aug 2026. Archived, **do not re-apply.** 28,979 bytes. |
| `seed.sql` | A one-line placeholder. `[db.seed] enabled = false`, so it does not run anyway. |
| `snippets/` | Empty. |

### The buckets

| Bucket | Public | Size limit | MIME types |
|---|:--:|---|---|
| `avatars` | yes | 5 MB | jpeg, png, webp |
| `shop-logos` | yes | 5 MB | jpeg, png, webp |
| `flyers` | yes | 10 MB | jpeg, png, webp, pdf |
| `licence-docs` | **no** | 10 MB | jpeg, png, pdf |
| `delivery-proofs` | **no** | 5 MB | jpeg, png |

Four policies cover them: public read on public buckets, authenticated upload to
public buckets, service-role management of private buckets, and owner management
of own objects. Trading licences and proof-of-delivery photos are private for
obvious reasons — do not flip them.

Note that the API's own uploads go to **Cloudflare R2** via
`POST /v1/uploads/presign`, not to these buckets. Both exist; R2 is what the
presign endpoint hands out.

## Why Prisma owns the database

Before 22 Aug 2026, `supabase/migrations/20260821123132_init_smartkasi.sql` was a
verbatim copy of `db/schema.sql` and `supabase/seed.sql` was a verbatim copy of
`db/seed.sql`. So `supabase start` created every `public.*` table itself, then
tried to seed `shops` — whose `owner_id` is a foreign key to `profiles`, and
`profiles` rows are trigger-created from `auth.users`, and the seed's
`insert into auth.users` block was commented out because the hosted path uses
GoTrue.

```
failed to send batch: ERROR: insert or update on table "shops"
  violates foreign key constraint "shops_owner_id_fkey" (SQLSTATE 23503)
Pruned containers: [supabase_db_SmartKasi]      # the database was destroyed on failure
```

The first attempted fix re-mirrored the files, which only made the violation
deterministic. The actual fix was to stop having two owners:

- The database moved to Prisma. `apps/api/prisma/migrations/20260822000001_init`
  holds the whole schema including the extensions, enums, views, triggers, check
  constraints and RLS policies Prisma cannot express in `schema.prisma`.
- The old mirror was archived, and the new Supabase migration creates **only**
  storage objects.
- `[db.seed] enabled = false` in `config.toml`, with `sql_paths = []`, so
  `supabase start` cannot FK-violate even if someone re-enables it by accident.

Seeding is now two-phase and the order is not optional:

```
supabase start              # storage buckets; public.* is EMPTY
prisma migrate deploy       # tables, views, triggers, RLS
npm run db:users            # six auth.users via the GoTrue Admin API
prisma db seed              # db/seed.sql — demo data, idempotent
```

Users before data, because shops FK to profiles and profiles come from
`auth.users`.

## Commands

Root scripts, all thin wrappers around the Supabase CLI:

```bash
npm run supabase:start           # npx supabase start
npm run supabase:stop            # npx supabase stop
npm run supabase:status          # ports and keys — where you get the local anon key
npm run supabase:reset           # npx supabase db reset — applies the storage migration only
npm run supabase:migration:new   # npx supabase migration new <name>  — Supabase-only delta
npm run supabase:diff            # npx supabase db diff -f <name>     — needs Docker and a running stack
```

`npm run supabase:types` also exists at the root. It writes to
`packages/types/supabase.ts`, **a directory that does not exist**, and nothing
imports its output. Do not rely on it.

Requires Docker Desktop. Without it, `migration list --local` returns
`dial ECONNREFUSED 127.0.0.1:54322`, which is expected — but the migration file
must still be non-empty.

After the stack is up, the database is still empty. Finish it from `apps/api`:

```bash
cd apps/api
npx prisma migrate deploy        # or `migrate dev --name <feature>` while developing
npm run db:users                 # six auth.users with fixed UUIDs, via GoTrue
npx prisma db seed               # db/seed.sql, idempotent
```

There is no `npm run db:setup`. Earlier revisions of this file and of
`apps/api/README.md` referenced one; it has never existed in
`apps/api/package.json`.

## Adding a migration

### A. Database change — Prisma

```bash
# edit apps/api/prisma/schema.prisma
cd apps/api
npx prisma migrate dev --name add_<feature>
# review the generated migration.sql; paste in raw SQL for triggers/RLS/views
npx prisma generate
# then hand-mirror the same statements into db/schema.sql.
# That file is a full create-from-nothing script — copying a delta over it
# truncates it down to the delta.
```

Never use `supabase migration new` for a `public.*` object.

### B. Storage or auth change — Supabase

```bash
npx supabase migration new add_<storage_feature>
# edit supabase/migrations/<ts>_add_<storage_feature>.sql — storage/auth ONLY
npx supabase db reset
```

Do not touch Prisma for a storage-only change, and do not copy it into
`db/schema.sql`.

## The access token hook

`config.toml` enables it for the local stack:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

The function itself is created by the Prisma migration
`20260824000001_role_claim_sync`, not by anything in this directory. GoTrue calls
it at token-mint time and it injects the live `profiles.role` as the
`app_metadata.role` claim — which is the only thing the API authorises on.

**On the hosted project this is a manual switch**: Dashboard → Authentication →
Hooks → Custom Access Token. It is not in any file in this repository. Turn it
off and every new signup silently becomes a permanent `customer`, which is
exactly the bug the migration replaced. The `Role claims` checks in
`apps/api/scripts/smoke.mjs` exist to make that loud.

`CONTRIBUTING.md` § 7 lists the rest of the state that lives outside git.

## Verify

```powershell
Get-ChildItem supabase/migrations/*.sql | Select Name, Length          # only 20260822000001_storage.sql
Select-String supabase/migrations/20260822000001_storage.sql -Pattern "storage.buckets"
Select-String supabase/migrations/*.sql -Pattern "create table public\."   # must find NOTHING
Select-String supabase/config.toml -Pattern "enabled = false" -Context 4   # [db.seed] must be one of them
npx supabase start                                                      # must succeed, no FK violation
npx supabase status                                                     # DB 54322, API 54321, Studio 54323

cd apps/api
npx prisma migrate status
npx prisma migrate deploy
npx prisma db seed
npm run smoke:auth                                                      # 47 checks
```

The third line is the one that matters most: a `create table public.` anywhere
under `supabase/migrations/` means somebody has recreated the bug of 22 Aug.

## The hosted project

Ref `wndilblmkkdyzpffmwap`, region `aws-1-eu-west-1`.

It was populated over `DIRECT_URL` (the session pooler on 5432) with
`prisma migrate deploy` and `apps/api/scripts/sql.mjs` — **not** with
`supabase db push`. Its `supabase_migrations` table is therefore empty as far as
the database schema is concerned. After a first `supabase link`,
`migration repair` is needed only for the storage migration; the Prisma
migrations are not and should not be tracked there.

Auth on this project signs **ES256**, so `SUPABASE_JWT_SECRET` stays blank and
the API verifies against
`https://wndilblmkkdyzpffmwap.supabase.co/auth/v1/.well-known/jwks.json`. See
[`apps/api/README.md`](../apps/api/README.md) § "HS256 vs JWKS".

## Further reading

- [`AGENTS.md`](../AGENTS.md) — the full ownership contract and migration procedure.
- [`apps/api/README.md`](../apps/api/README.md) — migrations from the Prisma side.
- [`apps/api/prisma/seed.ts`](../apps/api/prisma/seed.ts) — what `prisma db seed` runs.
- [`docs/ERD.md`](../docs/ERD.md) — the data model and why it looks the way it does.
