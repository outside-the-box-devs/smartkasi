import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Both files, .env.local first — matching the API's own precedence.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL when set. Supabase's transaction-mode pooler (port 6543)
    // cannot run the introspection and DDL the Prisma CLI needs; the
    // session-mode pooler (5432) can. The API itself still connects over
    // DATABASE_URL, which is where you want the pooler.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
