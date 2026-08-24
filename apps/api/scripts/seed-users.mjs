#!/usr/bin/env node
/**
 * Creates the five demo auth users through the Supabase Admin API, with the
 * exact UUIDs db/seed.sql expects.
 *
 * This replaces the `insert into auth.users` block in the seed. Writing that
 * table by hand works until it doesn't: GoTrue expects its token columns to be
 * empty strings rather than NULL, so a hand-rolled row signs in once and then
 * fails on refresh. Let GoTrue write its own rows.
 *
 *   node scripts/seed-users.mjs
 *
 * Idempotent: an existing user is updated in place, keeping its UUID.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

for (const line of readFileSync(resolve(here, '../.env'), 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (!m) continue;
  const value = m[2].trim().replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '');
  if (!(m[1] in process.env)) process.env[m[1]] = value;
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || key.startsWith('eyJ...')) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in apps/api/.env');
  process.exit(1);
}

const PASSWORD = 'Password123!';
const USERS = [
  ['11111111-0000-4000-8000-000000000001', 'thoko@smartkasi.test',    'Thoko Ndlovu',   'shop_owner'],
  ['11111111-0000-4000-8000-000000000002', 'sipho@smartkasi.test',    'Sipho Dlamini',  'shop_owner'],
  ['11111111-0000-4000-8000-000000000003', 'naledi@smartkasi.test',   'Naledi Khumalo', 'shop_owner'],
  ['22222222-0000-4000-8000-000000000002', 'customer@smartkasi.test', 'Lerato Mokoena', 'customer'],
  ['33333333-0000-4000-8000-000000000003', 'courier@smartkasi.test',  'Thabo Mahlangu', 'courier'],
  // app_metadata.role is belt-and-braces now: public.custom_access_token_hook
  // computes the claim from profiles.role at mint time and wins. It stays here
  // so that disabling the hook is a clean rollback rather than an outage.
  ['44444444-0000-4000-8000-000000000004', 'admin@smartkasi.test',    'Ayanda Mokwena', 'admin'],
];

const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

for (const [id, email, full_name, role] of USERS) {
  const body = {
    id,
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name },
    app_metadata: { role },
  };

  let res = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (res.status === 422 || res.status === 409) {
    // Already registered — update in place so the UUID and role stay stable.
    const { id: _drop, email: _e, ...patch } = body;
    res = await fetch(`${url}/auth/v1/admin/users/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      console.log(`~ ${email.padEnd(24)} updated  ${role}`);
      continue;
    }
  }

  if (!res.ok) {
    console.error(`✗ ${email}: ${res.status} ${await res.text()}`);
    process.exitCode = 1;
    continue;
  }

  const user = await res.json();
  const warn = user.id === id ? '' : `  !! got ${user.id}, expected ${id}`;
  console.log(`+ ${email.padEnd(24)} created  ${role}${warn}`);
  if (warn) process.exitCode = 1;
}

console.log(`\nAll five sign in with: ${PASSWORD}`);
