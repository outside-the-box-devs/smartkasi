-- =============================================================================
-- SUPERSEDED — do not apply this file.
--
-- This held a standalone copy of public.custom_access_token_hook, written when
-- db/schema.sql was the source of truth and could not be re-run against a
-- populated database (`create type` has no IF NOT EXISTS).
--
-- Prisma now owns public.* (AGENTS.md § 1), and a Prisma migration solves the
-- exact problem this file existed for: it applies a delta to a populated
-- database and records that it ran. The hook, both role-sync triggers, the
-- grants and the RLS policy all live in:
--
--   apps/api/prisma/migrations/20260824000001_role_claim_sync/migration.sql
--
-- Apply it with:
--
--   cd apps/api && npx prisma migrate deploy
--
-- Keeping a second definition here is what this whole ticket was about: two
-- places that describe the same thing, drifting apart until one of them lies.
-- The file is left as a pointer rather than deleted so that runbooks and issue
-- comments referencing this path land somewhere that explains itself.
--
-- Registering the hook is still a separate, manual step — see AGENTS.md § 5.
-- =============================================================================

do $$
begin
  raise exception
    'Superseded. Run: cd apps/api && npx prisma migrate deploy (20260824000001_role_claim_sync)';
end $$;
