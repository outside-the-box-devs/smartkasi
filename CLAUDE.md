# CLAUDE — SmartKasi Migrations (Prisma + Supabase)

> Mirror of `AGENTS.md:1`. Read that file first. This exists so Claude Code / Cursor / opencode all find the same contract regardless of which filename they probe.

**TL;DR for the next agent (2026-08-24 — Prisma owns DB; role claim fixed):**

1. `apps/api/prisma/schema.prisma:1` is the source of truth for `public.*`. `apps/api/prisma/migrations/20260822000001_init/migration.sql:1` (25872 bytes) holds the full SQL including triggers `443-490` and RLS `500-552` that Prisma cannot express. `db/schema.sql:1` is now a generated reference copy of that migration.
2. `supabase/migrations/20260822000001_storage.sql:1` owns **only** Supabase objects (`storage.buckets` + policies). Never put `public.*` tables there. The old `20260821123132_init_smartkasi.sql` (25872 bytes, verbatim copy of db/schema.sql) is archived to `supabase/migrations/archive/` — do not re-apply.
3. `supabase/seed.sql:1` is a 1-line Supabase-only placeholder (`enabled = false` in `supabase/config.toml:66-71`). DB demo data (3 shops + 12 products + orders + sales) is seeded via `apps/api/prisma/seed.ts:1` → `db/seed.sql:1` after `apps/api/scripts/seed-users.mjs:1` creates the 5 `auth.users` via GoTrue. `supabase start` therefore never hits `shops_owner_id_fkey` violation any more.
4. Workflow: `edit prisma/schema.prisma` → `npx prisma migrate dev --name <feature>` → add raw SQL for triggers/RLS if needed → `npx prisma generate` → hand-mirror the delta into `db/schema.sql` (`Copy-Item` is only correct for the initial migration). For storage: `npx supabase migration new add_<feature>` → edit only storage objects → `npx supabase db reset`.
5. **Role claim (2026-08-24).** `profiles.role` is the authority; `20260824000001_role_claim_sync` adds `t_profiles_role_to_auth`, `t_auth_role_to_profile`, and `custom_access_token_hook`. The hook is what makes a new signup correct on its FIRST token, and it must be enabled — `supabase/config.toml` locally, Dashboard -> Authentication -> Hooks on hosted. Never read a role from `raw_user_meta_data`. See `AGENTS.md` §2b.
6. Verification: `npx supabase start` must succeed with no FK violation (DB empty until `prisma migrate deploy`), `npx prisma migrate status` / `deploy` creates tables, `npx prisma db seed` is idempotent. See `AGENTS.md:6` checklist.

Full contract, verification checklist, and remote divergence notes live in `AGENTS.md:1`. If you change the migration strategy, update `AGENTS.md`, this file, and `supabase/README.md:1`.

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
