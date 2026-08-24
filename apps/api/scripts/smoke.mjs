#!/usr/bin/env node
/**
 * SmartKasi API smoke test.
 *
 *   node scripts/smoke.mjs
 *   node scripts/smoke.mjs --base https://smartkasi-api.up.railway.app/v1
 *
 * Runs the endpoints that matter against a running API with db/seed.sql loaded.
 * Exits non-zero if anything fails, so it works in CI as-is.
 *
 * Auth: if SUPABASE_JWT_SECRET is set (in the environment or apps/api/.env) the
 * script signs its own HS256 tokens. If your project uses asymmetric keys
 * instead, grab real tokens from the client and pass them:
 *
 *   OWNER_TOKEN=... OWNER2_TOKEN=... CUSTOMER_TOKEN=... node scripts/smoke.mjs
 */

import { createHmac, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---- config ---------------------------------------------------------------

const ENV_PATHS = [
  join(HERE, '..', '.env.local'),              // Supabase's dashboard snippets use this
  join(HERE, '..', '.env'),                    // the convention in this repo
  join(HERE, '..', '..', '..', '.env.local'),  // repo root variants
  join(HERE, '..', '..', '..', '.env'),
];
const ENV_FOUND = ENV_PATHS.filter(loadDotEnv);

const argBase = argValue('--base');
const PUBLIC_ONLY = process.argv.includes('--public-only');
const BASE = (argBase ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000/v1').replace(/\/$/, '');
const SECRET = process.env.SUPABASE_JWT_SECRET;

// Seeded ids from db/seed.sql.
const IDS = {
  owner1: '11111111-0000-4000-8000-000000000001',   // Mama Thoko's
  owner2: '11111111-0000-4000-8000-000000000002',   // Bra Sipho
  customer: '22222222-0000-4000-8000-000000000002', // Lerato
  courier: '33333333-0000-4000-8000-000000000003',  // Thabo, bicycle, verified
  admin: '44444444-0000-4000-8000-000000000004',    // Ayanda, platform operator
  shop1: '7b0e1c2a-1111-4a3b-9c11-aaaaaaaaaaaa',
  shop2: '7b0e1c2a-2222-4a3b-9c11-bbbbbbbbbbbb',
  shop3: '7b0e1c2a-3333-4a3b-9c11-cccccccccccc',    // advertising_only
  maize: '3f0a9d10-aaaa-4c11-9999-111111111111',
  soap: '3f0a9d10-bbbb-4c11-9999-222222222222',
  chakalaka: '3f0a9d10-dddd-4c11-9999-444444444444',
  maizeBarcode: '6001068000456',
};

const TOKENS = {
  owner1: process.env.OWNER_TOKEN ?? mint(IDS.owner1, 'shop_owner'),
  owner2: process.env.OWNER2_TOKEN ?? mint(IDS.owner2, 'shop_owner'),
  customer: process.env.CUSTOMER_TOKEN ?? mint(IDS.customer, 'customer'),
  courier: process.env.COURIER_TOKEN ?? mint(IDS.courier, 'courier'),
  admin: process.env.ADMIN_TOKEN ?? mint(IDS.admin, 'admin'),
};

// ---- tiny test harness ----------------------------------------------------

let passed = 0;
const failures = [];
const c = process.stdout.isTTY
  ? { g: '\x1b[32m', r: '\x1b[31m', d: '\x1b[2m', y: '\x1b[33m', x: '\x1b[0m' }
  : { g: '', r: '', d: '', y: '', x: '' };

async function check(name, fn) {
  try {
    const detail = await fn();
    passed++;
    console.log(`  ${c.g}PASS${c.x}  ${name}${detail ? `  ${c.d}${detail}${c.x}` : ''}`);
  } catch (err) {
    failures.push({ name, message: err.message });
    console.log(`  ${c.r}FAIL${c.x}  ${name}\n        ${c.r}${err.message}${c.x}`);
  }
}

let skipped = 0;

/** Used for the authenticated checks when --public-only is passed. */
async function checkAuth(name, fn) {
  if (PUBLIC_ONLY) {
    skipped++;
    console.log(`  ${c.y}SKIP${c.x}  ${name}  ${c.d}(needs a token)${c.x}`);
    return;
  }
  return check(name, fn);
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

async function api(path, { method = 'GET', token, body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // A dead connection mid-run is more useful as a readable failure than as
    // an undici stack trace.
    return { status: 0, body: null, raw: '', networkError: err.cause?.code ?? err.message };
  }
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  return { status: res.status, body: json, raw: text };
}

const rands = (cents) => `R${(cents / 100).toFixed(2)}`;

// ---- run ------------------------------------------------------------------

const authSource = SECRET
  ? 'self-signed HS256'
  : process.env.OWNER_TOKEN
    ? 'tokens from env'
    : `${c.y}none${c.x}`;

console.log(`\nSmartKasi smoke test  ${c.d}${BASE}${c.x}`);
console.log(`Env file: ${ENV_FOUND.length ? c.d + ENV_FOUND.join(', ') + c.x : c.y + 'none found' + c.x}`);
console.log(`Auth:     ${authSource}\n`);

// --- health first -----------------------------------------------------------
// Whether the database is connected is more fundamental than whether you have a
// token, so this runs before the auth gate. You should never be blocked on a
// token while the real problem is that Postgres is unreachable.

console.log('System');
const health = await api('/health');
if (health.status !== 200) {
  console.error(`${c.r}Cannot reach the API at ${BASE}.${c.x}`);
  if (health.networkError) {
    console.error(`  ${health.networkError} — nothing is listening there.`);
    console.error('  Start it with:  npm run start:dev   (from apps/api)');
  } else {
    console.error(`  HTTP ${health.status}.`);
    console.error('  Check the base URL — the API is served under /v1, so it should end in /v1.');
  }
  console.error('');
  process.exit(1);
}
await check('health returns ok', () => {
  expect(health.body.status === 'ok', `status is "${health.body.status}" — "degraded" means the API is up but the database is NOT. Fix DATABASE_URL before anything else.`);
  return `v${health.body.version}`;
});

// --- auth gate --------------------------------------------------------------

if (!TOKENS.owner1 && !PUBLIC_ONLY) {
  console.log(`\n${c.y}No way to authenticate — stopping before the authenticated checks.${c.x}`);
  console.log('');
  console.log('  To run just the public checks right now:');
  console.log(`    ${c.d}npm run smoke -- --public-only${c.x}`);
  console.log('');
  console.log('  For the full suite, this script needs to present a token the API accepts.');
  console.log('  It has to match however the API itself is configured:');
  console.log('');
  console.log(`    ${c.d}Legacy Supabase (HS256 shared secret)${c.x}`);
  console.log('      Put the same SUPABASE_JWT_SECRET in apps/api/.env that the API uses,');
  console.log('      and this script will sign its own tokens.');
  console.log('');
  console.log(`    ${c.d}Newer Supabase (asymmetric keys)${c.x}`);
  console.log('      SUPABASE_JWT_SECRET is blank by design. Sign in as each seeded user');
  console.log('      from a client, then pass the real access tokens:');
  console.log('        OWNER_TOKEN=... OWNER2_TOKEN=... CUSTOMER_TOKEN=... npm run smoke');
  console.log('');
  console.log('  Seeded users:');
  console.log(`    owner, Mama Thoko's   ${IDS.owner1}`);
  console.log(`    owner, Bra Sipho      ${IDS.owner2}`);
  console.log(`    customer (Lerato)     ${IDS.customer}`);
  console.log('');
  process.exit(1);
}

const seedCheck = await api(`/shops?lat=-26.238&lng=27.9083&radius_m=3000`);
if (!seedCheck.body?.data?.length) {
  console.error(`\n${c.r}No shops found. Did you run db/seed.sql?${c.x}`);
  console.error('  npm run db:seed   (from apps/api)\n');
  process.exit(1);
}

console.log('\nShops & geo');
await check('nearby shops have real distances', () => {
  const shops = seedCheck.body.data;
  expect(shops.length === 2, `expected 2 shops within 3km, got ${shops.length}`);
  const thoko = shops.find((s) => s.name.startsWith('Mama Thoko'));
  expect(thoko, "Mama Thoko's Tuckshop missing");
  expect(typeof thoko.distance_m === 'number', 'distance_m is not a number');
  return shops.map((s) => `${s.name.split(' ')[0]} ${s.distance_m}m`).join(', ');
});

await check('radius actually filters (500m)', async () => {
  const r = await api('/shops?lat=-26.238&lng=27.9083&radius_m=500');
  expect(r.body.meta.total === 1, `expected 1 shop within 500m, got ${r.body.meta.total}`);
  return '1 shop';
});

await check('advertising-only shop cannot take orders', async () => {
  const r = await api(`/shops/${IDS.shop3}`);
  expect(r.body.accepts_orders === false, 'Kasi Fresh should not accept orders');
  expect(r.body.licence_status === 'none', `licence_status is ${r.body.licence_status}`);
  return 'licence gate holding';
});

console.log('\nCatalog & price comparison');
await check('price comparison across shops', async () => {
  const r = await api('/search/products?q=maize&lat=-26.238&lng=27.9083&radius_m=5000');
  const hit = r.body.data[0];
  expect(hit, 'no results for "maize"');
  expect(hit.price_stats.offer_count === 3, `expected 3 offers, got ${hit.price_stats.offer_count}`);
  expect(hit.offers[0].price_cents <= hit.offers[1].price_cents, 'offers are not sorted cheapest first');
  return `${hit.price_stats.offer_count} offers, ${rands(hit.price_stats.min_price_cents)}–${rands(hit.price_stats.max_price_cents)}, avg ${rands(hit.price_stats.avg_price_cents)}`;
});

await check('shop-local items excluded from comparison', async () => {
  const r = await api('/search/products?q=kota');
  expect(r.body.meta.total === 0, `kota has no barcode so it must not be comparable, got ${r.body.meta.total}`);
  return '0 results, correct';
});

await check('barcode scan returns price + stock in one call', async () => {
  const r = await api(`/products/barcode/${IDS.maizeBarcode}?shop_id=${IDS.shop1}`);
  expect(r.status === 200, `status ${r.status}`);
  expect(r.body.shop_product, 'shop_product missing — pass shop_id');
  return `${r.body.product.name} @ ${rands(r.body.shop_product.price_cents)}, ${r.body.shop_product.stock_qty} in stock`;
});

await check('unknown barcode returns 404 PRODUCT_NOT_FOUND', async () => {
  const r = await api('/products/barcode/0000000000000');
  expect(r.status === 404, `status ${r.status}`);
  expect(r.body.error.code === 'PRODUCT_NOT_FOUND', `code ${r.body.error?.code}`);
  return 'normal outcome, not an error condition';
});

console.log('\nAuth');
await check('no token returns 401', async () => {
  const r = await api('/me');
  expect(r.status === 401, `status ${r.status}`);
  return r.body.error.code;
});

await checkAuth('owner token resolves the profile', async () => {
  const r = await api('/me', { token: TOKENS.owner1 });
  expect(r.status === 200, `status ${r.status} ${r.body?.error?.code ?? ''} — if this is UNAUTHENTICATED, your HS256 vs JWKS setting is wrong`);
  expect(r.body.role === 'shop_owner', `role is ${r.body.role}`);
  expect(r.body.shop_ids.includes(IDS.shop1), 'owner is not linked to Mama Thoko\'s');
  return `${r.body.full_name}, ${r.body.shop_ids.length} shop`;
});


// --- the role claim --------------------------------------------------------
// These only mean something under `npm run smoke:auth`. mint() hard-codes the
// role into self-signed HS256 tokens, so plain `npm run smoke` would pass the
// first two with the hook switched off entirely.
await checkAuth('courier token carries the courier claim', async () => {
  const role = claimRole(TOKENS.courier);
  expect(role === 'courier', `app_metadata.role is ${role ?? 'absent'} — is the custom access token hook registered?`);
  return REAL_TOKENS ? 'from the hook' : 'self-signed, proves nothing';
});

await checkAuth('the claim is what authorises, not the profile row', async () => {
  const denied = await api('/courier/jobs', { token: TOKENS.customer });
  expect(denied.status === 403, `customer got ${denied.status} on the job board`);
  const allowed = await api('/courier/jobs', { token: TOKENS.courier });
  expect(allowed.status === 200, `courier got ${allowed.status} on the job board`);
  return '403 for the customer, 200 for the courier';
});

// The actual regression test for issue #21: change the row, and the NEXT token
// must carry the new role. Reverts itself, but it does write — like the POS
// batch and the order below it, this suite is for demo data only.
await checkAuth('a role change reaches the next token', async () => {
  if (!REAL_TOKENS) return 'skipped — needs smoke:auth, self-signed tokens cannot show this';

  const elevate = await api(`/admin/users/${IDS.customer}/role`, {
    method: 'PATCH', token: TOKENS.admin, body: { role: 'courier' },
  });
  expect(elevate.status === 200, `elevate returned ${elevate.status} ${elevate.body?.error?.code ?? ''}`);

  try {
    const fresh = await signIn('customer@smartkasi.test');
    expect(claimRole(fresh) === 'courier', `new token still says ${claimRole(fresh)} — the hook is not reading profiles.role`);
    const jobs = await api('/courier/jobs', { token: fresh });
    expect(jobs.status === 200, `elevated user got ${jobs.status} on the job board`);
  } finally {
    await api(`/admin/users/${IDS.customer}/role`, {
      method: 'PATCH', token: TOKENS.admin, body: { role: 'customer' },
    });
  }

  const reverted = await signIn('customer@smartkasi.test');
  expect(claimRole(reverted) === 'customer', `revert failed, still ${claimRole(reverted)}`);
  return 'customer -> courier -> customer, claim followed each time';
});
console.log('\nPOS & offline sync');
const saleId = randomUUID();
const batch = {
  sales: [
    {
      client_sale_id: saleId,
      sold_at: new Date().toISOString(),
      payment_method: 'cash',
      subtotal_cents: 3450, discount_cents: 0, total_cents: 3450,
      amount_tendered_cents: 5000, change_cents: 1550,
      items: [
        { product_id: IDS.maize, qty: 1, unit_price_cents: 2000 },
        { product_id: IDS.soap, qty: 2, unit_price_cents: 725 },
      ],
    },
    {
      // Deliberately wrong: total != subtotal - discount. Must fail ALONE.
      client_sale_id: randomUUID(),
      sold_at: new Date().toISOString(),
      subtotal_cents: 3450, discount_cents: 0, total_cents: 3400,
      items: [{ product_id: IDS.maize, qty: 1, unit_price_cents: 3450 }],
    },
  ],
};

await checkAuth('batch flush: partial success returns 207', async () => {
  const r = await api(`/shops/${IDS.shop1}/sales/batch`, { method: 'POST', token: TOKENS.owner1, body: batch });
  expect(r.status === 207, `status ${r.status}`);
  expect(r.body.summary.created === 1, `expected 1 created, got ${r.body.summary.created}`);
  expect(r.body.summary.failed === 1, `expected 1 failed, got ${r.body.summary.failed}`);
  const bad = r.body.results.find((x) => x.status === 'failed');
  expect(bad.error.code === 'TOTALS_MISMATCH', `expected TOTALS_MISMATCH, got ${bad.error?.code}`);
  return 'one bad sale did not block the good one';
});

await checkAuth('replaying the same batch does NOT double-count', async () => {
  const r = await api(`/shops/${IDS.shop1}/sales/batch`, { method: 'POST', token: TOKENS.owner1, body: batch });
  expect(r.body.summary.created === 0, `replay created ${r.body.summary.created} extra sales — idempotency is broken`);
  expect(r.body.summary.duplicate === 1, `expected 1 duplicate, got ${r.body.summary.duplicate}`);
  return 'duplicate reported as success — clear it from the device queue';
});

await checkAuth('daily cash-up is populated', async () => {
  const r = await api(`/shops/${IDS.shop1}/reports/daily`, { token: TOKENS.owner1 });
  expect(r.body.sale_count > 0, 'no sales today — check the Africa/Johannesburg day bucketing');
  return `${r.body.sale_count} sales, ${rands(r.body.net_cents)} net`;
});

await checkAuth('low-stock alert fires', async () => {
  const r = await api(`/shops/${IDS.shop1}/inventory/low-stock`, { token: TOKENS.owner1 });
  expect(r.body.meta.total >= 1, 'nothing flagged low — seed sets Clover Fresh Milk to 3/6');
  return r.body.data.map((i) => `${i.product.name} ${i.stock_qty}/${i.low_stock_threshold}`).join(', ');
});

await checkAuth('offline delta pull returns a cursor', async () => {
  const r = await api(`/shops/${IDS.shop1}/sync`, { token: TOKENS.owner1 });
  expect(r.body.is_full_snapshot === true, 'first pull should be a full snapshot');
  expect(r.body.server_time, 'server_time missing — the client needs it as the next cursor');
  expect(r.body.inventory.length > 0, 'no inventory in the snapshot');
  return `${r.body.inventory.length} lines, cursor ${r.body.server_time}`;
});

console.log('\nOrders');
let quoteId, orderId;
await checkAuth('quote prices a two-shop basket', async () => {
  const r = await api('/orders/quote', {
    method: 'POST', token: TOKENS.customer,
    body: {
      fulfilment_type: 'delivery', dropoff_lat: -26.2461, dropoff_lng: 27.9212,
      items: [
        { shop_id: IDS.shop1, product_id: IDS.maize, qty: 1 },
        { shop_id: IDS.shop2, product_id: IDS.chakalaka, qty: 2 },
      ],
    },
  });
  expect(r.status === 200, `status ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);
  expect(r.body.fee_breakdown.length >= 1, 'fee_breakdown is empty — the customer must see why');
  quoteId = r.body.quote_id;
  return `${rands(r.body.subtotal_cents)} + ${rands(r.body.service_fee_cents)} fee = ${rands(r.body.total_cents)}`;
});

await checkAuth('order placed from the quote', async () => {
  const r = await api('/orders', {
    method: 'POST', token: TOKENS.customer,
    body: { quote_id: quoteId, dropoff_address: '77 Mooki St, Orlando East', dropoff_notes: 'Blue gate' },
  });
  expect(r.status === 201, `status ${r.status} ${JSON.stringify(r.body).slice(0, 120)}`);
  orderId = r.body.id;
  return `${r.body.order_number}, ${r.body.status}, ${rands(r.body.total_cents)}`;
});

await checkAuth('reusing a spent quote returns 409', async () => {
  const r = await api('/orders', { method: 'POST', token: TOKENS.customer, body: { quote_id: quoteId } });
  expect(r.status === 409, `status ${r.status}`);
  expect(r.body.error.code === 'QUOTE_EXPIRED', `code ${r.body.error?.code}`);
  return 'quotes are single-use';
});

await checkAuth('one shop accepts, the other rejects', async () => {
  const a = await api(`/orders/${orderId}/legs/${IDS.shop1}/accept`, { method: 'POST', token: TOKENS.owner1, body: {} });
  expect(a.status === 200, `accept status ${a.status}`);
  const b = await api(`/orders/${orderId}/legs/${IDS.shop2}/reject`, { method: 'POST', token: TOKENS.owner2, body: { reason: 'out_of_stock' } });
  expect(b.status === 200, `reject status ${b.status}`);

  const o = await api(`/orders/${orderId}`, { token: TOKENS.customer });
  expect(o.body.status === 'partially_accepted', `order status is ${o.body.status}`);
  const rejected = o.body.legs.find((l) => l.status === 'rejected');
  expect(rejected.rejected_reason === 'out_of_stock', 'rejection reason lost');
  return `${o.body.status}, total now ${rands(o.body.total_cents)}`;
});

await checkAuth('a shop cannot touch another shop\'s leg', async () => {
  const r = await api(`/orders/${orderId}/legs/${IDS.shop1}/accept`, { method: 'POST', token: TOKENS.owner2, body: {} });
  expect(r.status === 403, `status ${r.status} — this MUST be 403`);
  return 'cross-shop write blocked';
});

await checkAuth('ordering from an unlicensed shop returns 422', async () => {
  const r = await api('/orders/quote', {
    method: 'POST', token: TOKENS.customer,
    body: { fulfilment_type: 'collection', items: [{ shop_id: IDS.shop3, product_id: IDS.maize, qty: 1 }] },
  });
  expect(r.status === 422, `status ${r.status}`);
  expect(r.body.error.code === 'SHOP_NOT_ACCEPTING_ORDERS', `code ${r.body.error?.code}`);
  return 'trading-licence gate holding';
});

await checkAuth('shop sees the order in its queue', async () => {
  const r = await api(`/shops/${IDS.shop1}/orders`, { token: TOKENS.owner1 });
  expect(r.body.data.length > 0, 'queue is empty');
  const leg = r.body.data[0];
  expect(!('customer_last_name' in leg), 'shop should only get a first name');
  return `${r.body.data.length} legs, customer shown as "${leg.customer_first_name}"`;
});


console.log('\nDelivery & dispatch');
let deliveryId, payoutCents;

/**
 * Every key in a response, at any depth.
 *
 * The customer delivery view is a whitelist built field by field, and this is
 * what proves it stayed one. A single accidental spread of a database row would
 * ship pickup addresses, the customer's phone number, or a courier position to
 * every device — so this asserts on absence, not on the happy path.
 */
function allKeys(value, found = new Set()) {
  if (Array.isArray(value)) { value.forEach((v) => allKeys(v, found)); return found; }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) { found.add(k); allKeys(v, found); }
  }
  return found;
}

await checkAuth('customer requests a courier', async () => {
  const r = await api(`/orders/${orderId}/delivery`, { method: 'POST', token: TOKENS.customer, body: {} });
  expect(r.status === 202, `status ${r.status} ${JSON.stringify(r.body).slice(0, 140)}`);
  expect(r.body.status === 'unassigned', `status is ${r.body.status}`);
  expect(r.body.courier === null, 'courier revealed before anyone was assigned');
  expect(r.body.eta_band === null, 'an unassigned delivery cannot have an ETA');
  deliveryId = r.body.id;
  return `${r.body.id.slice(0, 8)}, unassigned`;
});

await checkAuth('requesting twice returns the same delivery, not a 409', async () => {
  const r = await api(`/orders/${orderId}/delivery`, { method: 'POST', token: TOKENS.customer, body: {} });
  expect(r.status === 202, `status ${r.status}`);
  expect(r.body.id === deliveryId, 'a second request created a second delivery');
  return 'idempotent on order_id';
});

await checkAuth('the job reaches the courier board', async () => {
  const r = await api('/courier/jobs', { token: TOKENS.courier });
  expect(r.status === 200, `status ${r.status} ${JSON.stringify(r.body).slice(0, 140)}`);
  const job = r.body.data.find((j) => j.delivery_id === deliveryId);
  expect(job, 'the delivery we just requested is not on the board');
  expect(job.pickup_count === 1, `pickup_count ${job.pickup_count} — the rejected leg is not a pickup`);
  expect(job.total_distance_m > 0, 'total_distance_m is 0 — the route was never measured');

  const o = await api(`/orders/${orderId}`, { token: TOKENS.customer });
  const expected = Math.round((o.body.service_fee_cents * 80) / 100);
  expect(job.payout_cents === expected, `payout ${job.payout_cents}, expected ${expected} (80% of the service fee)`);
  payoutCents = job.payout_cents;
  return `${job.order_number}, ${job.total_distance_m}m, pays ${rands(job.payout_cents)}`;
});

await checkAuth('a customer cannot read the courier board', async () => {
  const r = await api('/courier/jobs', { token: TOKENS.customer });
  expect(r.status === 403, `status ${r.status} — pickup addresses MUST NOT reach a customer`);
  return 'role gate holding';
});

await checkAuth('courier accepts the job', async () => {
  const r = await api(`/courier/jobs/${deliveryId}/accept`, { method: 'POST', token: TOKENS.courier });
  expect(r.status === 200, `status ${r.status} ${JSON.stringify(r.body).slice(0, 140)}`);
  expect(r.body.status === 'assigned', `status is ${r.body.status}`);
  expect(r.body.pickups[0].address_line, 'the courier view must carry pickup addresses');
  expect(r.body.cash_to_collect_cents > 0, 'nothing to collect — v1 is cash on handover');
  return `assigned, ${r.body.pickups.length} pickup, collect ${rands(r.body.cash_to_collect_cents)}`;
});

await checkAuth('a second accept returns 409, not a silent steal', async () => {
  const r = await api(`/courier/jobs/${deliveryId}/accept`, { method: 'POST', token: TOKENS.courier });
  expect(r.status === 409, `status ${r.status} — two couriers racing for one job must not both win`);
  expect(r.body.error.code === 'DELIVERY_ALREADY_ASSIGNED', `code ${r.body.error?.code}`);
  return 'conditional update held the line';
});

await checkAuth('the customer view carries no location, route or phone', async () => {
  const r = await api(`/deliveries/${deliveryId}`, { token: TOKENS.customer });
  expect(r.status === 200, `status ${r.status}`);
  expect(r.body.courier === null, 'the courier is named before the goods are even collected');

  const banned = [
    'lat', 'lng', 'latitude', 'longitude', 'phone', 'customer_phone', 'address_line',
    'dropoff', 'dropoff_address', 'dropoff_notes', 'pickups', 'positions',
    'courier_id', 'payout_cents', 'cash_to_collect_cents', 'proof_photo_url',
  ];
  const keys = allKeys(r.body);
  const leaked = banned.filter((k) => keys.has(k));
  expect(leaked.length === 0, `LEAKED: ${leaked.join(', ')} — see docs/API_CONTRACT.md § Route privacy`);
  return `${[...keys].length} keys, none of them a location`;
});

await checkAuth('collecting from a shop that is not on the run is refused', async () => {
  const r = await api(`/courier/jobs/${deliveryId}/collect`, {
    method: 'POST', token: TOKENS.courier, body: { shop_id: IDS.shop3 },
  });
  expect(r.status === 422, `status ${r.status}`);
  return 'wrong shop rejected';
});

await checkAuth('an empty collect body works — the courier app sends one', async () => {
  const r = await api(`/courier/jobs/${deliveryId}/collect`, { method: 'POST', token: TOKENS.courier, body: {} });
  expect(r.status === 200, `status ${r.status} ${JSON.stringify(r.body).slice(0, 140)} — shop_id must stay optional`);
  expect(r.body.status === 'collected', `status is ${r.body.status}`);
  expect(r.body.pickups.every((pk) => pk.collected), 'a pickup is still open');

  const o = await api(`/orders/${orderId}`, { token: TOKENS.customer });
  expect(o.body.status === 'dispatched', `order status is ${o.body.status}, expected dispatched`);
  return 'last pickup collected -> order dispatched';
});

await checkAuth('the courier is named only once the goods are collected', async () => {
  const r = await api(`/deliveries/${deliveryId}`, { token: TOKENS.customer });
  expect(r.body.courier !== null, 'courier still hidden after collection');
  expect(/^\S+ \S\.$/.test(r.body.courier.display_name), `display_name "${r.body.courier.display_name}" is not "First L."`);
  expect(r.body.eta_band !== null, 'no ETA band once a courier is on the way');
  expect(!('phone' in r.body.courier), 'courier phone number leaked to the customer');
  return `${r.body.courier.display_name}, ${r.body.eta_band}`;
});

await checkAuth('short cash at handover is refused', async () => {
  const r = await api(`/courier/jobs/${deliveryId}/deliver`, {
    method: 'POST', token: TOKENS.courier, body: { cash_collected_cents: 1 },
  });
  expect(r.status === 422, `status ${r.status}`);
  expect(r.body.error.code === 'TOTALS_MISMATCH', `code ${r.body.error?.code}`);
  return 'a short handover is a conversation at the gate, not a silent write';
});

await checkAuth('handover completes the order', async () => {
  const o = await api(`/orders/${orderId}`, { token: TOKENS.customer });
  const r = await api(`/courier/jobs/${deliveryId}/deliver`, {
    method: 'POST', token: TOKENS.courier, body: { cash_collected_cents: o.body.total_cents },
  });
  expect(r.status === 200, `status ${r.status} ${JSON.stringify(r.body).slice(0, 140)}`);
  expect(r.body.status === 'delivered', `status is ${r.body.status}`);

  const after = await api(`/orders/${orderId}`, { token: TOKENS.customer });
  expect(after.body.status === 'completed', `order status is ${after.body.status}`);
  expect(after.body.delivery?.status === 'delivered', 'the order no longer reports its own delivery');
  return `delivered, order completed, courier earned ${rands(payoutCents)}`;
});

console.log('\nStubs (shape only — values are fake)');
await checkAuth('AI dish endpoint is marked as a stub', async () => {
  const r = await api('/ai/dish-ingredients', { method: 'POST', token: TOKENS.customer, body: { dish: 'pap and chakalaka' } });
  expect(r.body._stub === true, 'stub marker missing');
  return 'returns a fixed basket — do not build logic on it';
});

await checkAuth('payments returns not_implemented, not a fake success', async () => {
  const r = await api('/payments/intent', { method: 'POST', token: TOKENS.customer, body: { order_id: orderId } });
  expect(r.body.status === 'not_implemented', `status ${r.body.status}`);
  expect(r.body.checkout_url === null, 'checkout_url should be null');
  return 'v1 is cash only';
});

// ---- summary --------------------------------------------------------------

const total = passed + failures.length;
console.log(`\n${'-'.repeat(58)}`);
if (failures.length === 0) {
  const note = skipped ? ` ${c.y}${skipped} skipped — run without --public-only for the full suite.${c.x}` : '';
  console.log(`${c.g}All ${total} checks passed.${c.x}${note}\n`);
  process.exit(0);
}
console.log(`${c.r}${failures.length} of ${total} checks failed:${c.x}`);
for (const f of failures) console.log(`  ${c.r}·${c.x} ${f.name}\n    ${f.message}`);
console.log('');
process.exit(1);

// ---- helpers --------------------------------------------------------------

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
}

/**
 * Minimal .env reader. Deliberately tolerant: CRLF line endings (Windows),
 * quoted values, `export` prefixes, blank lines and comments. A stray \r in a
 * JWT secret produces tokens the API rejects with no useful error, so the
 * trimming here is load-bearing.
 */
function loadDotEnv(path) {
  try {
    const text = readFileSync(path, 'utf8');
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      let value = m[2].trim().replace(/^(['"])(.*)\1$/s, '$2');
      if (!process.env[key]) process.env[key] = value;
    }
    return true;
  } catch {
    return false;
  }
}


// ---- role claim helpers ---------------------------------------------------

/**
 * True when the tokens came from GoTrue rather than from mint() below.
 * Only real tokens exercise the custom access token hook, so the claim checks
 * announce which mode they ran in instead of quietly proving nothing.
 */
const REAL_TOKENS = Boolean(process.env.COURIER_TOKEN);

/** The role the API will actually authorise on — read from the token, not /me. */
function claimRole(token) {
  if (!token) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return payload?.app_metadata?.role;
  } catch {
    return undefined;
  }
}

/**
 * Sign a demo user in for a FRESH token. The point is the round trip: a role
 * change only shows up in a newly minted token, so re-reading an existing one
 * would pass whether the hook works or not.
 */
async function signIn(email) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from apps/api/.env');

  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'Password123!' }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.access_token) {
    throw new Error(`sign-in for ${email} failed (${res.status}) — run \`npm run db:users\``);
  }
  return body.access_token;
}
function mint(sub, role) {
  if (!SECRET) return undefined;
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const payload = b64({ sub, app_metadata: { role }, iat: now, exp: now + 3600 });
  const sig = createHmac('sha256', SECRET).update(`${head}.${payload}`).digest('base64url');
  return `${head}.${payload}.${sig}`;
}
