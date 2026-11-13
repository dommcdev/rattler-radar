import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * The app's database. libSQL reads a local SQLite file in development and
 * talks to Turso when DATABASE_URL points there; nothing else changes.
 */
export const db = drizzle({
  connection: { url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN },
  schema,
});
