#!/usr/bin/env node
/**
 * Minimal psql stand-in, so `db:schema` / `db:seed` work on a machine without
 * the Postgres client installed (Windows dev boxes, CI images).
 *
 * Always connects on DIRECT_URL — the session-mode pooler on 5432. The
 * transaction pooler on 6543 cannot run DDL or the `do $$ ... $$` blocks the
 * seed uses.
 *
 *   node scripts/sql.mjs -f ../../db/schema.sql
 *   node scripts/sql.mjs -c "select count(*) from shops"
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));

// Tiny .env reader — no dotenv dependency in this package.
for (const line of readFileSync(resolve(here, '../.env'), 'utf8').split('\n')) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (!m) continue;
  const value = m[2].trim().replace(/\s+#.*$/, '').replace(/^["']|["']$/g, '');
  if (!(m[1] in process.env)) process.env[m[1]] = value;
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('DIRECT_URL (or DATABASE_URL) is not set in apps/api/.env');
  process.exit(1);
}

const args = process.argv.slice(2);
const fileIdx = args.findIndex((a) => a === '-f' || a === '--file');
const cmdIdx = args.findIndex((a) => a === '-c' || a === '--command');

let sql;
let label;
if (fileIdx !== -1) {
  const path = resolve(process.cwd(), args[fileIdx + 1]);
  sql = readFileSync(path, 'utf8');
  label = path;
} else if (cmdIdx !== -1) {
  sql = args.slice(cmdIdx + 1).join(' ');
  label = 'inline command';
} else {
  console.error('usage: sql.mjs (-f <file> | -c <sql>)');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
console.error(`→ ${label}`);

try {
  // Simple query protocol: sends the whole file in one go, which is what lets
  // multi-statement files and dollar-quoted bodies through unmangled.
  const result = await client.query(sql);
  for (const r of [result].flat()) {
    if (r?.rows?.length) console.table(r.rows);
    else if (r?.command) console.error(`  ${r.command} ${r.rowCount ?? ''}`.trimEnd());
  }
  console.error('✓ ok');
} catch (err) {
  console.error(`✗ ${err.message}`);
  if (err.position) {
    const upto = sql.slice(0, Number(err.position));
    console.error(`  at line ${upto.split('\n').length}: ${upto.split('\n').pop()}`);
  }
  process.exitCode = 1;
} finally {
  await client.end();
}
