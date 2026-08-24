/**
 * SmartKasi — Prisma seed
 *
 * Replaces the old `supabase db reset` seed path. Creates the five demo
 * auth.users via GoTrue Admin API (so tokens refresh correctly), then
 * applies db/seed.sql via Postgres (preserving shop/product/order/sales
 * demo data and the stock-ledger triggers).
 *
 * Idempotent: db/seed.sql uses `on conflict do nothing` + `do $$` guard for
 * sales. Re-running does not double data.
 *
 * Usage:
 *   npx prisma migrate deploy   # create tables (incl. views/triggers/RLS)
 *   npx prisma db seed          # runs this file (via prisma.config.ts seed)
 *   # or: npm run prisma:seed
 *
 * For Supabase local, run after `supabase start`:
 *   npx prisma migrate deploy && node scripts/seed-users.mjs && npx prisma db seed
 *   # or npm run db:setup
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

// Minimal .env loader (no hard dep on dotenv) - matches prisma.config.ts
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { config: loadEnv } = require('dotenv');
  loadEnv({ path: resolve(__dirname, '../.env.local') });
  loadEnv({ path: resolve(__dirname, '../.env') });
} catch {
  // dotenv not available - rely on env already set
}

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('DIRECT_URL or DATABASE_URL must be set in apps/api/.env');
  console.error('For Supabase local: postgresql://postgres:postgres@127.0.0.1:54322/postgres');
  process.exit(1);
}

// 1) Ensure auth.users exist via GoTrue Admin API if SUPABASE_URL is set.
async function ensureAuthUsers() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || serviceKey.startsWith('eyJ...')) {
    console.warn('! SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — skipping auth user creation');
    console.warn('  Demo shops will FK-violate unless profiles already exist.');
    console.warn('  Set them in apps/api/.env and run `npm run db:users` if needed.');
    return;
  }

  const PASSWORD = 'Password123!';
  const USERS: Array<[string, string, string, string]> = [
    ['11111111-0000-4000-8000-000000000001', 'thoko@smartkasi.test', 'Thoko Ndlovu', 'shop_owner'],
    ['11111111-0000-4000-8000-000000000002', 'sipho@smartkasi.test', 'Sipho Dlamini', 'shop_owner'],
    ['11111111-0000-4000-8000-000000000003', 'naledi@smartkasi.test', 'Naledi Khumalo', 'shop_owner'],
    ['22222222-0000-4000-8000-000000000002', 'customer@smartkasi.test', 'Lerato Mokoena', 'customer'],
    ['33333333-0000-4000-8000-000000000003', 'courier@smartkasi.test', 'Thabo Mahlangu', 'courier'],
  ];

  const headers: Record<string, string> = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };

  console.log('→ ensuring 5 demo auth.users via GoTrue Admin API…');
  for (const [id, email, full_name, role] of USERS) {
    const body: any = {
      id,
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name },
      app_metadata: { role },
    };

    let res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (res.status === 422 || res.status === 409) {
      const { id: _drop, email: _e, ...patch } = body;
      res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        console.log(`  ~ ${email.padEnd(24)} updated  ${role}`);
        continue;
      }
    }

    if (!res.ok) {
      const text = await res.text();
      console.error(`  ✗ ${email}: ${res.status} ${text}`);
      continue;
    }

    const user = (await res.json()) as { id: string };
    const warn = user.id === id ? '' : `  !! got ${user.id}, expected ${id}`;
    console.log(`  + ${email.padEnd(24)} created  ${role}${warn}`);
  }
}

// 2) Apply db/seed.sql via pg (handles dollar-quoted DO blocks, multi statements)
async function applyDbSeed() {
  const seedPath = resolve(__dirname, '../../../db/seed.sql');
  let sql: string;
  try {
    sql = readFileSync(seedPath, 'utf8');
  } catch (e: any) {
    console.error(`✗ cannot read ${seedPath}: ${e.message}`);
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  console.log(`→ applying ${seedPath}`);
  try {
    const result: any = await client.query(sql);
    for (const r of [result].flat()) {
      if (r?.command) console.error(`  ${r.command} ${r.rowCount ?? ''}`.trimEnd());
    }
    console.log('✓ db/seed.sql applied');
  } catch (err: any) {
    console.error(`✗ seed failed: ${err.message}`);
    if (err.position) {
      const upto = sql.slice(0, Number(err.position));
      console.error(`  at line ${upto.split('\n').length}: ${upto.split('\n').pop()}`);
    }
    process.exitCode = 1;
    throw err;
  } finally {
    await client.end();
  }
}

async function main() {
  await ensureAuthUsers();
  await applyDbSeed();
  console.log('✓ Prisma seed complete — All five sign in with: Password123!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
