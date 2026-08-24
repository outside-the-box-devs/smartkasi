-- =============================================================================
-- Role claim sync — 2026-08-24
--
-- Fixes: profiles.role was documented as being mirrored into the JWT, but no
-- trigger ever did it. The only writer of the claim was
-- apps/api/scripts/seed-users.mjs, so every user who signed up through the app
-- was a customer permanently and the courier / shop-owner apps had no front
-- door.
--
-- Four moving parts, because none of them covers the gaps the others leave:
--
--   1. handle_new_auth_user() now seeds profiles.role FROM the admin-supplied
--      app_metadata claim, closing the other direction of the divergence (the
--      demo users' JWTs said shop_owner while their profile row said customer,
--      and only db/seed.sql patched it up afterwards).
--
--   2. t_profiles_role_to_auth mirrors profiles.role into
--      auth.users.raw_app_meta_data on insert and update, which is what the
--      comment on profiles.role has always claimed. This is what RLS, the
--      Supabase dashboard and any direct-to-Supabase Flutter client read.
--
--   3. t_auth_role_to_profile handles the case 1 cannot see: the Admin API
--      INSERTs the user and UPDATEs raw_app_meta_data in two statements, so
--      the role claim does not exist yet when the insert trigger runs, and
--      profiles.role would stay customer while the claim said shop_owner.
--
--   4. custom_access_token_hook() is what actually makes a *brand-new* signup
--      correct on its FIRST token. GoTrue builds the first access token from
--      its in-memory user struct inside the signup transaction, so a trigger
--      writing raw_app_meta_data after that point is too late — the user would
--      still get `customer` until a refresh. The hook is called by GoTrue at
--      mint time for every token, reads profiles.role live, and therefore also
--      makes a role change take effect on the next issued token with no
--      mirroring lag.
--
-- The hook must also be switched on outside this file:
--   local   supabase/config.toml -> [auth.hook.custom_access_token]
--   hosted  Dashboard -> Authentication -> Hooks -> Custom Access Token
-- Without that, parts 1-3 still work and behaviour degrades to
-- correct-after-refresh rather than incorrect-forever.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- A defensive cast. An unrecognised role must not abort a signup — GoTrue
-- reports a trigger error as a generic 500 and the user simply cannot register.
-- -----------------------------------------------------------------------------
create or replace function public.safe_user_role(candidate text)
returns user_role
language sql
immutable
as $$
  select case
    when candidate in ('customer', 'shop_owner', 'shop_staff', 'courier', 'admin')
      then candidate::user_role
    else 'customer'::user_role
  end;
$$;

comment on function public.safe_user_role(text) is
  'Casts text to user_role, falling back to customer. Never raises, so a bad claim cannot break signup.';


-- -----------------------------------------------------------------------------
-- 1. Signup: take the role from raw_app_meta_data when the Admin API set one.
--
-- SECURITY: raw_app_meta_data only. raw_user_meta_data is whatever the client
-- put in the signup body, so reading a role from it would let anyone register
-- as an admin. Do not "helpfully" add it back.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user() returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    public.safe_user_role(nullif(new.raw_app_meta_data->>'role', '')),
    coalesce(new.raw_user_meta_data->>'full_name', 'SmartKasi user'),
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;


-- -----------------------------------------------------------------------------
-- 2. The mirror the comment always promised.
--
-- The `is distinct from` guard means the common case — Admin API creates a user
-- with a role, the trigger writes a profile with the same role — performs no
-- write at all, so there is no update storm during seeding.
-- -----------------------------------------------------------------------------
create or replace function public.sync_profile_role_to_auth() returns trigger as $$
begin
  update auth.users
     set raw_app_meta_data =
           coalesce(raw_app_meta_data, '{}'::jsonb)
           || jsonb_build_object('role', new.role::text)
   where id = new.id
     and coalesce(raw_app_meta_data->>'role', '') is distinct from new.role::text;
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

drop trigger if exists t_profiles_role_to_auth on public.profiles;
create trigger t_profiles_role_to_auth
  after insert or update of role on public.profiles
  for each row execute function public.sync_profile_role_to_auth();


-- -----------------------------------------------------------------------------
-- 3. And the way in, which the insert-time read above cannot cover.
--
-- GoTrue's Admin API does NOT create a user with app_metadata in one statement.
-- It INSERTs the row and then UPDATEs raw_app_meta_data separately, so at
-- t_on_auth_user_created time the role claim is not there yet and
-- handle_new_auth_user() sees nothing. Without this trigger,
-- `npm run db:users` leaves five users whose claim says shop_owner / courier
-- while their profile row says customer — and since the hook below reads
-- profiles.role, they would then be issued customer tokens.
--
-- Termination: both directions guard on `is distinct from`, so an update
-- propagates exactly one hop and the return trip is a no-op.
-- -----------------------------------------------------------------------------
create or replace function public.sync_auth_role_to_profile() returns trigger as $$
declare
  v_role user_role;
begin
  if nullif(new.raw_app_meta_data->>'role', '') is null then
    return new;
  end if;

  v_role := public.safe_user_role(new.raw_app_meta_data->>'role');

  update public.profiles
     set role = v_role
   where id = new.id
     and role is distinct from v_role;

  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

drop trigger if exists t_auth_role_to_profile on auth.users;
create trigger t_auth_role_to_profile
  after update of raw_app_meta_data on auth.users
  for each row execute function public.sync_auth_role_to_profile();


-- -----------------------------------------------------------------------------
-- 4. The access-token hook. This is the one that fixes first-token signup.
--
-- Contract (Supabase): receives {user_id, claims, authentication_method},
-- returns the same object with claims modified. The API reads
-- app_metadata.role, so that is where the role goes — the guard needs no
-- change.
-- -----------------------------------------------------------------------------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role     text;
  v_claims   jsonb;
  v_app_meta jsonb;
begin
  select p.role::text
    into v_role
    from public.profiles p
   where p.id = (event->>'user_id')::uuid;

  v_claims   := coalesce(event->'claims', '{}'::jsonb);
  v_app_meta := coalesce(v_claims->'app_metadata', '{}'::jsonb);

  -- No profile row yet is not an error: fall back to whatever GoTrue already
  -- had, then to customer. Least privilege on the unknown path.
  v_app_meta := v_app_meta || jsonb_build_object(
    'role',
    coalesce(v_role, v_app_meta->>'role', 'customer')
  );

  -- Two steps, not one: jsonb_set cannot create a nested path whose parent is
  -- missing, and 'claims' being absent must not blow up token issuance.
  return jsonb_set(
    jsonb_set(event, '{claims}', v_claims, true),
    '{claims,app_metadata}', v_app_meta, true
  );
end;
$$;

comment on function public.custom_access_token_hook(jsonb) is
  'Supabase custom access token hook. Injects profiles.role into app_metadata.role at mint time, so the FIRST token after signup is already correct. Enable in supabase/config.toml locally and in Dashboard -> Authentication -> Hooks on hosted.';

-- GoTrue calls the hook as supabase_auth_admin, which needs to reach the
-- function and read the table. Nothing else may execute it.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant execute on function public.safe_user_role(text) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

grant select on table public.profiles to supabase_auth_admin;

-- profiles has RLS enabled, and supabase_auth_admin does not bypass it.
drop policy if exists profiles_auth_admin_read on public.profiles;
create policy profiles_auth_admin_read on public.profiles
  as permissive for select to supabase_auth_admin
  using (true);


-- -----------------------------------------------------------------------------
-- 5. Make the documentation describe something that exists.
-- -----------------------------------------------------------------------------
comment on column public.profiles.role is
  'Authoritative. Mirrored into auth.users.raw_app_meta_data->>''role'' by t_profiles_role_to_auth, and read live at token-mint time by custom_access_token_hook. The API trusts the JWT claim; this column is what the claim is built from.';


-- -----------------------------------------------------------------------------
-- 6. Backfill. Existing rows have never been through either path.
-- -----------------------------------------------------------------------------

-- auth.users that carry a role the profile does not: profile wins going
-- forward, but on an existing project the claim is the value that has actually
-- been in use, so adopt it first.
update public.profiles p
   set role = public.safe_user_role(u.raw_app_meta_data->>'role')
  from auth.users u
 where u.id = p.id
   and nullif(u.raw_app_meta_data->>'role', '') is not null
   and u.raw_app_meta_data->>'role' is distinct from p.role::text;

-- then push every profile role out to the claim.
update auth.users u
   set raw_app_meta_data =
         coalesce(u.raw_app_meta_data, '{}'::jsonb)
         || jsonb_build_object('role', p.role::text)
  from public.profiles p
 where p.id = u.id
   and coalesce(u.raw_app_meta_data->>'role', '') is distinct from p.role::text;
