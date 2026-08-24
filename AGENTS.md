# AGENTS — SmartKasi Migrations (Prisma + Supabase)

> **Read this before touching `db/`, `supabase/`, or `apps/api/prisma/`.**
> Updated 2026-08-24 — Prisma owns the DB; Supabase owns auth/storage only; the
> role claim is computed at token-mint time (§ 2b).
> For everything else — branching, verification, commits, CI — see [`CONTRIBUTING.md`](CONTRIBUTING.md).
> This file is the contract for AI agents. Root `README.md` and `apps/api/README.md` are human docs.

## 1. Source of truth (DO NOT CREATE A SECOND ONE)

- **`apps/api/prisma/schema.prisma:1` is canonical for `public.*`** — 16 models, enums, indexes. DB migrations live in `apps/api/prisma/migrations/`:
  - `20260822000001_init/migration.sql:1` (verbatim copy of the former `db/schema.sql`, 25872 bytes, includes triggers, RLS, views, check constraints).
  - `20260824000001_role_claim_sync/migration.sql:1` — the role-claim fix (see §2b). Raw SQL only; no model changed, so `schema.prisma` is untouched by it.

  Run via `prisma migrate`.
- **`supabase/migrations/20260822000001_storage.sql:1` is canonical for Supabase-only** — `storage.buckets` + `storage.objects` policies. Never put `public.*` tables/enums here. Supabase CLI applies this on `supabase start` / `supabase db reset`.
- **`db/schema.sql:1` is now a REFERENCE COPY** of the Prisma initial migration for tooling that expects a single SQL file (`scripts/sql.mjs -f ../../db/schema.sql` still works). Do not edit it as source — edit `prisma/schema.prisma` + add a new Prisma migration, then copy the migration SQL back to `db/schema.sql` if you need the file in sync.
- **`db/seed.sql:1` is the demo-data SQL** (17921 bytes, 3 shops + 12 products + orders + sales). It is executed by `apps/api/prisma/seed.ts:1` AFTER `apps/api/scripts/seed-users.mjs:1` has created the 5 `auth.users` via GoTrue Admin API. It is **not** executed by `supabase/seed.sql` any more.
- **`supabase/seed.sql:1` is Supabase-only seed** (minimal, storage demo objects only). `supabase/config.toml:66-71` has `[db.seed] enabled = false` so `supabase start` does not FK-violate on `shops_owner_id_fkey`.
- **`apps/api/prisma/schema.prisma:1` is derived only in the old workflow; now it is source. `npx prisma db pull` is for inspection only, not for workflow.**

**Rule:** Edit `prisma/schema.prisma` → `npx prisma migrate dev --name <feature>` → review `prisma/migrations/<ts>_<name>/migration.sql` (add raw SQL for triggers/RLS/views if needed) → `npx prisma generate` → hand-mirror the same statements into `db/schema.sql` (which is a full create-from-nothing script — `Copy-Item` is only correct for the initial migration). Never `prisma migrate dev` for Supabase-only objects; use `supabase migration new` for those.

## 2. Why this changed (the bug fixed 2026-08-22)

**Before (2026-08-22):** `supabase/migrations/20260821123132_init_smartkasi.sql` was a **verbatim copy** of `db/schema.sql` and `supabase/seed.sql` was a verbatim copy of `db/seed.sql`. `supabase start` therefore created all `public.*` tables via Supabase, then tried to seed `shops` with `owner_id` FK to `profiles` where `profiles` rows didn't exist — because `profiles` are `auth.users` trigger-created and the seed's `insert into auth.users` block was **commented out** (hosted path uses GoTrue). Result:

```
failed to send batch: ERROR: insert or update on table "shops" violates foreign key constraint "shops_owner_id_fkey" (SQLSTATE 23503)
Pruned containers: [supabase_db_SmartKasi]  # DB destroyed on failure
```

Fix **A** (2026-08-22 morning) mirrored the files but did not fix the FK — it just made `supabase db reset` produce the same violation deterministically.

**After (2026-08-22 — this fix):**

- DB ownership moved to **Prisma only** (`prisma/migrations/20260822000001_init` holds the full schema, including extensions `uuid-ossp` + `pg_trgm`, 10 enums `38-49`, triggers `443-490`, RLS `500-552`).
- `supabase/migrations/20260821123132_init_smartkasi.sql` → archived to `supabase/migrations/archive/`. New `supabase/migrations/20260822000001_storage.sql` creates **only** `storage.buckets` (avatars, shop-logos, flyers, licence-docs, delivery-proofs) + policies — never `public.*`.
- `supabase/config.toml:66-71` → `[db.seed] enabled = false, sql_paths = []`. `supabase/seed.sql` is now a 1-line Supabase-only placeholder so `supabase start` cannot FK-violate even if re-enabled.
- Seeding is `supabase start` (empty public.* + storage buckets) → `npx prisma migrate deploy` (create tables) → `npm run db:users` (GoTrue Admin API, 5 users with fixed UUIDs) → `npx prisma db seed` (runs `prisma/seed.ts` → `db/seed.sql` via `pg`, idempotent `on conflict do nothing` + `do $$` guard `193-197`).

**Before:** `npx supabase db reset` → violation → no DB.
**After:** `npx supabase start` → ok (storage only), `cd apps/api && npx prisma migrate deploy && npx prisma db seed` → ok (shops exist).

## 2b. The role claim (fixed 2026-08-24) — do not break this

`profiles.role` was documented as being mirrored into
`auth.users.raw_app_meta_data->>'role'` by a trigger. **That trigger was never
written.** The only thing that had ever set the claim was
`apps/api/scripts/seed-users.mjs:53` passing `app_metadata: { role }` to the
Admin API for the five demo users. The API authorises on the claim and nothing
else (`src/common/guards/supabase-auth.guard.ts`), so every user who signed up
through the app was a `customer` permanently — the courier and shop-owner apps
had no front door. It stayed invisible because every test ran as a
pre-provisioned demo user.

`20260824000001_role_claim_sync` adds four things. They are not redundant — each
covers a gap the others cannot, and the whole set was verified end to end against
a local GoTrue (see §6):

| Object | Fixes |
|---|---|
| `handle_new_auth_user()` (rewritten) | Seeds `profiles.role` **from** `raw_app_meta_data->>'role'`, so an Admin-API user's row and claim agree from the start. Reads `raw_app_meta_data` only — `raw_user_meta_data` is client-supplied, and reading a role from it is privilege escalation. |
| `t_profiles_role_to_auth` on `profiles` | The mirror the comment always promised. Keeps `raw_app_meta_data` in step for RLS, the dashboard, and direct-to-Supabase Flutter clients. |
| `t_auth_role_to_profile` on `auth.users` | The way back in. GoTrue's Admin API does **not** create a user with `app_metadata` in one statement — it INSERTs the row and UPDATEs `raw_app_meta_data` after, so at `t_on_auth_user_created` time the claim is not there yet. Without this, `npm run db:users` leaves all five demo users on `profiles.role = 'customer'` while their claim says `shop_owner` — and because the hook reads `profiles.role`, they would then be issued **customer** tokens. Found by testing, not by reading. |
| `custom_access_token_hook(jsonb)` | The one that makes a **new signup correct on its first token**. GoTrue mints that token from its in-memory user struct inside the signup transaction, so a trigger writing `raw_app_meta_data` afterwards is too late. The hook runs at mint time and reads `profiles.role` live, which is also why a role change lands on the next issued token with no lag. |

**The hook has to be switched on, or it silently does nothing:**

- local — `supabase/config.toml` `[auth.hook.custom_access_token]`, already set
- hosted — Dashboard → Authentication → Hooks → Custom Access Token,
  `pg-functions://postgres/public/custom_access_token_hook`. **Manual step; it is
  not in any migration.**

Two ways this regresses quietly, both covered by the `Role claims` smoke checks:

- dropping the `profiles_auth_admin_read` RLS policy — the hook runs as
  `supabase_auth_admin`, which does not bypass RLS, so it reads no row and every
  token falls back to `customer`
- disabling the hook — signup goes back to correct-only-after-refresh

Verified locally on 2026-08-24 (`supabase start` + `prisma migrate deploy` +
`db:users`, real ES256 tokens from local GoTrue):

- an Admin-API courier's **first** token carries `role=courier`
- `update profiles set role='shop_owner'` reaches `raw_app_meta_data` **and** the
  next token, with no refresh
- with `t_profiles_role_to_auth` deliberately disabled so `raw_app_meta_data`
  went stale, the token still followed `profiles.role` — proving the hook, not
  the mirror, is what sets the claim
- a self-service `POST /auth/v1/signup` carrying `data: {"role":"admin"}` gets
  `customer`, because nothing reads `raw_user_meta_data`
- full suite: **39/39**

## 3. Workflow for every change (MANDATORY)

### A. DB change (tables, enums, indexes, triggers, RLS, views)

```powershell
# 1. Edit Prisma source
code apps/api/prisma/schema.prisma

# 2. Create a migration (needs a running DB — see §4)
npx supabase start                  # storage buckets + empty public.* (enabled=false seed)
cd apps/api
npx prisma migrate dev --name add_<feature>
# Review the generated prisma/migrations/<ts>_add_<feature>/migration.sql
# If you added enums/checks/triggers/RLS that Prisma cannot scaffold, paste
# the raw SQL from your reviewed diff into that migration.sql before it runs.
# For the initial migration this was a verbatim copy of db/schema.sql.

# 3. Keep the reference SQL in sync (optional but keeps scripts/sql.mjs working)
#    `db/schema.sql` is a FULL create-from-nothing script. Copy-Item is only ever
#    correct for the initial migration — doing it for a delta truncates the file
#    to that delta. For a delta, hand-apply the same statements to the right
#    sections of db/schema.sql (see 20260824000001_role_claim_sync for an example).

# 4. Regenerate client
npx prisma generate  # writes apps/api/src/generated/prisma (importFileExtension="" per schema.prisma:21)

# 5. Verify locally (see §6)
npx supabase status          # DB 54322 per supabase/config.toml:35
npx prisma migrate status
npm run prisma:seed          # or npx prisma db seed (idempotent)
```

**Never:**
- Create `public.*` objects via `supabase migration new` — that creates a second source of truth and `prisma migrate` will later try to drop/recreate triggers (`db/schema.sql:443-490`).
- Edit `supabase/migrations/*.sql` for DB objects — drift → `supabase db diff` shadow DB (`supabase/config.toml:37` `shadow_port=54320`) diverges from Prisma's shadow.
- Hand-edit `db/schema.sql` as source — it's now a mirror. Edit `schema.prisma` + migration instead.
- Run `npx prisma db pull` as a workflow step — it drops triggers/RLS from the schema. Use it only to inspect drift.

### B. Supabase-only change (storage buckets, auth hooks, realtime, etc.)

```powershell
# 1. Create a Supabase migration (Supabase CLI naming)
npx supabase migration new add_<storage_feature>   # or npm run supabase:migration:new
# Edit supabase/migrations/<ts>_add_<storage_feature>.sql — ONLY storage/auth objects.
# Example: insert into storage.buckets ...

# 2. Apply locally
npx supabase db reset   # or npx supabase start (applies storage migrations only; DB seed disabled)
npx supabase status

# 3. Do NOT touch Prisma for this change. Do NOT copy to db/schema.sql.
```

### C. Seed change (demo shops/products/orders/sales)

```powershell
# 1. Edit the canonical demo SQL
code db/seed.sql          # has `on conflict do nothing` + `do $$` guard 193-197

# 2. If you changed auth users (UUIDs, roles), also edit:
code apps/api/scripts/seed-users.mjs   # Admin API, 5 fixed UUIDs
code apps/api/prisma/seed.ts           # calls seed-users logic + applies db/seed.sql via pg

# 3. `supabase/seed.sql` stays minimal — never copy db/seed.sql there. See AGENTS.md §1.

# 4. Apply + verify locally
npx supabase start
cd apps/api
npx prisma migrate deploy
npm run db:users          # GoTrue — must run before seed (profiles FK)
npx prisma db seed        # idempotent; re-running does not double sales
```

## 4. Local CLI expectations

- `supabase/config.toml:5` `project_id = "SmartKasi"` (capitalized, CLI normalizes)
- `supabase/config.toml:42` `major_version = 17` must match remote `SHOW server_version;`
- `supabase/config.toml:44` `pooler.enabled = false` locally — local `DATABASE_URL` is direct `54322`, not `6543/5432` pooler (`apps/api/.env.example:16-17`)
- `supabase/config.toml:59-64` `[db.migrations] enabled=true, schema_paths=[]` — migration-file mode (not declarative `schemas/`). `experimental.pgdelta.enabled=true` for `db diff`.
- `supabase/config.toml:66-71` `[db.seed] enabled=false, sql_paths=[]` — **intentionally disabled**. DB seed is via `prisma db seed`. Do not re-enable without fixing FK-violation guard.
- `package.json:9-16` root scripts `supabase:start|stop|reset|status|types|migration:new|diff` are thin wrappers over `npx supabase` (`supabase@2.115.0` is the CLI, not `@supabase/supabase-js`).
- `apps/api/package.json:22-30` `prisma:migrate|deploy|seed|reset|generate|pull` wrap Prisma CLI; `db:setup` = `prisma migrate deploy && npm run db:users && prisma db seed`.
- `apps/api/prisma.config.ts:8-19` supplies `DATASOURCE_URL` as `DIRECT_URL ?? DATABASE_URL` — `DIRECT_URL` on `5432` for CLI, `DATABASE_URL` on `54322` locally / `6543` remotely.
- Docker **must** be running for any `--local` command (`supabase start` → Postgres 54322, Studio 54323, Inbucket 54324).

## 5. Remote vs local divergence (2026-08-22 state)

- Remote project `wndilblmkkdyzpffmwap` (eu-west-1, per `README.md:72`) was populated via `apps/api/scripts/sql.mjs:28` on `DIRECT_URL` (session pooler 5432) — **not** via `supabase db push`. So remote `supabase_migrations` table is empty or has stale hash.
- **Before first `supabase link` + `db push` (if you ever push Supabase-only migrations):** `npx supabase link --project-ref wndilblmkkdyzpffmwap` then `npx supabase migration repair` is not needed for DB (Prisma handles it) — only for storage migrations if remote lacks them. DB pushes remain `prisma migrate deploy` over `DIRECT_URL`.
- Seed on remote uses `db/seed.sql:18-53` commented `auth.users` block — users created via `apps/api/scripts/seed-users.mjs` (`npm run db:users`) through GoTrue, not SQL. Local `prisma/seed.ts` inherits same logic.
- Archived: `supabase/migrations/archive/20260821123132_init_smartkasi.sql` — the former DB mirror, kept for history. Do not apply again.
- **The custom access token hook is dashboard state, not SQL.** The migration defines `public.custom_access_token_hook`, but defining it does nothing until it is registered. Local: `supabase/config.toml` `[auth.hook.custom_access_token]`. Remote: **Dashboard → Authentication → Hooks → Custom Access Token**, pointed at `public.custom_access_token_hook`. If roles stop working on remote and nothing in git changed, check this toggle first — it is the one piece of behaviour no file in this repo can assert.

## 6. Verification checklist for next agent

```powershell
# Supabase side (must be empty public.* until Prisma runs, no FK violation)
Get-ChildItem supabase/migrations/*.sql | Select Name, Length  # expect only 20260822000001_storage.sql (+ archive)
Get-Content supabase/migrations/20260822000001_storage.sql | Select-String "storage.buckets"  # must exist
Get-Content supabase/seed.sql | Select-String "Prisma"  # must mention Prisma, must NOT contain "insert into shops"
Select-String supabase/config.toml -Pattern "enabled = false" -Context 2  # db.seed must be false
npx supabase start    # should succeed with "Seeding data from supabase/seed.sql" either skipped or 1-line select
npx supabase status   # DB 54322, Studio 54323, API 54321, no violation

# Prisma side (owns public.*)
Get-ChildItem apps/api/prisma/migrations -Recurse -Filter migration.sql | Select FullName, Length  # expect 20260822000001_init 25872 + 20260824000001_role_claim_sync
Get-Content apps/api/prisma/migrations/migration_lock.toml  # provider = "postgresql"
cd apps/api
npx prisma migrate status    # should list 20260822000001_init as pending/applied
npx prisma migrate deploy    # creates enums, tables, views, triggers, RLS
npx prisma generate          # regenerates src/generated/prisma
npm run db:users             # needs SUPABASE_URL + SERVICE_ROLE_KEY in .env (see .env.example)
npx prisma db seed           # applies db/seed.sql via pg, idempotent
npx prisma status  # optional: check

# Full round-trip
npx supabase db reset        # re-applies storage migration only, wipes public.* (so re-run prisma deploy + seed)
cd apps/api; npx prisma migrate deploy; npx prisma db seed
```

## 7. Where to document further changes

- Update this file (`AGENTS.md:1`) + `CLAUDE.md:1` (same content) + `supabase/README.md:1` when migration strategy changes.
- Update `apps/api/README.md:217` Migrations section (now Prisma-only for DB, Supabase for storage).
- Update `README.md:21` Layout block (list `supabase/migrations/*_storage.sql` + `apps/api/prisma/migrations/` as owners).

## 8. References

- Canonical Prisma: `apps/api/prisma/schema.prisma:13-31`, `apps/api/prisma/migrations/20260822000001_init/migration.sql:1`, `apps/api/prisma/seed.ts:1`
- Supabase-only: `supabase/migrations/20260822000001_storage.sql:1`, `supabase/seed.sql:1`, `supabase/config.toml:59-71`
- Reference mirror: `db/schema.sql:1` (generated copy), `db/seed.sql:1` (canonical demo SQL, executed by Prisma seed)
- Config: `apps/api/prisma.config.ts:8-19`, `apps/api/package.json:22-30` (`prisma:*`, `db:users`, `db:setup`)
- Docs: `docs/ERD.md:3`, `README.md:21-30`, `apps/api/README.md:217-227`, `supabase/README.md:1`

<!-- ASTRYX:START -->
Astryx v0.4.6 · 158 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing, page frame included.
- Frame first: read `astryx docs layout` before writing any page or screen — page frame, region widths, breakpoint behavior.
- Dense data = rows (Table, List/Item), never Card-wrapped list items; Card is for standalone widgets. Status = StatusDot/Token; Badge = counts only.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). No raw hex/px. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent belongs in the theme (`astryx theme list` / `theme add <slug>`, or `astryx theme template` for a custom one) — never override --color-* in :root.
- SELF-CHECK before you finish: re-read the file and replace any raw <div>/<span> layout, imported .css/@apply, or hardcoded value (#hex, 16px) with the component or a token (var(--color-*|--spacing-*|…)). If unsure a component/prop exists, run `astryx component <Name>` / `astryx search "<thing>"`; don't hand-roll CSS.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   158 components by category
  template --list    page + block recipes
  docs <topic>       browser-support, cli-integrations, color, elevation, getting-started, icons, illustrations, internationalization, layout, migration, motion, principles, shape, spacing, styling-libraries, styling, theme, tokens, typography, working-with-ai
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->
