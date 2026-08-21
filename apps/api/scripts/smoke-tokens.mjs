#!/usr/bin/env node
/**
 * Signs the seeded demo users in and runs the smoke suite with their tokens.
 *
 *   node scripts/smoke-tokens.mjs
 *   node scripts/smoke-tokens.mjs --base https://smartkasi-api.up.railway.app/v1
 *
 * smoke.mjs signs its own HS256 tokens when SUPABASE_JWT_SECRET is set. This
 * project signs ES256, so there is no secret to sign with and the 15
 * authenticated checks would silently skip. Real tokens from GoTrue are the
 * only way to run them — and they exercise the JWKS path the API actually uses,
 * which a self-signed token never would.
 *
 * Any flag is passed through to smoke.mjs unchanged.
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
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
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in apps/api/.env');
  process.exit(1);
}

const PASSWORD = 'Password123!';
// Same three users smoke.mjs expects, by the env var it reads each from.
const USERS = [
  ['OWNER_TOKEN', 'thoko@smartkasi.test'],
  ['OWNER2_TOKEN', 'sipho@smartkasi.test'],
  ['CUSTOMER_TOKEN', 'customer@smartkasi.test'],
];

const env = { ...process.env };

for (const [varName, email] of USERS) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await res.json();

  if (!res.ok || !body.access_token) {
    console.error(`✗ sign-in failed for ${email}: ${res.status} ${JSON.stringify(body)}`);
    console.error('  Run `npm run db:users` first — the demo users may not exist yet.');
    process.exit(1);
  }

  const alg = JSON.parse(Buffer.from(body.access_token.split('.')[0], 'base64url')).alg;
  console.log(`✓ ${email.padEnd(24)} ${alg}  -> ${varName}`);
  env[varName] = body.access_token;
}

// Blank it explicitly: smoke.mjs prefers self-signed HS256 when a secret is
// present, which would defeat the point of fetching real tokens.
env.SUPABASE_JWT_SECRET = '';

console.log('');
spawn(process.execPath, [join(here, 'smoke.mjs'), ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
}).on('exit', (code) => process.exit(code ?? 1));
