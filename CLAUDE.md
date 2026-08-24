# CLAUDE — SmartKasi Supabase Local Migrations

> Mirror of `AGENTS.md:1`. Read that file first. This exists so Claude Code / Cursor / opencode all find the same contract regardless of which filename they probe.

**TL;DR for the next agent:**

1. `db/schema.sql:1` is the source of truth. `supabase/migrations/20260821123132_init_smartkasi.sql:1` is a verbatim copy (26443 bytes, SHA256 `B765F2...`). `supabase/seed.sql:1` is a verbatim copy of `db/seed.sql:1` (17921 bytes). Do not edit the `supabase/` copies alone.
2. Fix **A** was applied 2026-08-22 because the migration was `0 bytes` and `supabase/seed.sql` was missing → `supabase db reset` produced an empty DB.
3. Future schema change: `edit db/schema.sql` → `Copy-Item db/schema.sql supabase/migrations/<timestamp>_<name>.sql` → `Copy-Item db/seed.sql supabase/seed.sql` if needed → `npx supabase db reset` (needs Docker, `supabase/config.toml:35` port 54322) → `cd apps/api; npx prisma db pull; npx prisma generate`.
4. Never `prisma migrate dev` (dual source drops `db/schema.sql:452-496` triggers) and never `supabase db diff` without mirroring back to `db/schema.sql`.

Full contract, verification checklist, and remote divergence notes live in `AGENTS.md:1`. If you change the migration strategy, update `AGENTS.md`, this file, and `supabase/README.md:1`.
