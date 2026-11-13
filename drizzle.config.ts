import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Load .env.local the same way Next.js does, so drizzle-kit sees the same database.
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (see .env.example)");

/** Used by `bun run db:push`, which syncs the database to the schema directly. */
export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema",
  dbCredentials: { url, authToken: process.env.DATABASE_AUTH_TOKEN },
});
