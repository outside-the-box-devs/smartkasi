-- =============================================================================
-- SK-01 — profiles.role reaches the JWT (issue #21)
--
-- The delta only. db/schema.sql is canonical and already contains all of this;
-- this file exists because schema.sql is NOT idempotent (`create type` has no
-- IF NOT EXISTS), so it cannot be re-run against the populated remote project.
--
--   cd apps/api && node scripts/sql.mjs -f ../../db/patches/2026-08-24_role_claim_hook.sql
--
-- Safe to run more than once. Applying this is only half the job — the hook
-- must then be registered in Dashboard > Authentication > Hooks, or it is
-- defined and never called. See AGENTS.md § 5.
-- =============================================================================

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb;
  app_meta  jsonb;
  user_role text;
begin
  select p.role::text
    into user_role
    from public.profiles p
   where p.id = (event->>'user_id')::uuid;

  claims   := coalesce(event->'claims', '{}'::jsonb);
  app_meta := coalesce(claims->'app_metadata', '{}'::jsonb)
              || jsonb_build_object('role', coalesce(user_role, 'customer'));

  return jsonb_set(event, '{claims}',
                   claims || jsonb_build_object('app_metadata', app_meta));
exception
  -- A hook that raises blocks token issuance for EVERY user on the project.
  when others then
    return event;
end;
$$;

grant usage   on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant select  on table public.profiles to supabase_auth_admin;

revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

-- Without this the hook's SELECT is filtered out by RLS and every user
-- authorises as 'customer'. create policy has no IF NOT EXISTS, hence the drop.
drop policy if exists "auth admin reads roles" on public.profiles;
create policy "auth admin reads roles" on public.profiles
  as permissive for select to supabase_auth_admin using (true);

comment on column profiles.role is
  'Source of truth for authorisation. Reaches the JWT as app_metadata.role via public.custom_access_token_hook, computed at token-mint time. Changing this row takes effect on the user''s next token, not their current one.';
