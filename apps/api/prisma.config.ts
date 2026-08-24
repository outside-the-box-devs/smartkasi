import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";

// Minimal .env loader (no dotenv dependency) — mirrors apps/api/scripts/sql.mjs
// Loads .env.local first, then .env, without overwriting already-set vars.
for (const file of [".env.local", ".env"]) {
  const path = resolve(file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    if (key in process.env) continue;
    const value = m[2].trim().replace(/\s+#.*$/, "").replace(/^["']|["']$/g, "");
    if (value) process.env[key] = value;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL when set. Supabase's transaction-mode pooler (port 6543)
    // cannot run the introspection and DDL the Prisma CLI needs; the
    // session-mode pooler (5432) can. The API itself still connects over
    // DATABASE_URL, which is where you want the pooler.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
