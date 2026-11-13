import { z } from "zod";

/**
 * Server-side environment variables, validated once at startup so a missing
 * value fails loudly instead of causing confusing errors later.
 * Set them in `.env` (see `.env.example`).
 */
const envSchema = z.object({
  /** A local SQLite file (`file:data/rattlerradar.db`) or a Turso URL (`libsql://…`). */
  DATABASE_URL: z.string().min(1),
  /** Only needed for Turso. */
  DATABASE_AUTH_TOKEN: z.string().min(1).optional(),
  /** Signs session cookies. Generate with `openssl rand -base64 32`. */
  BETTER_AUTH_SECRET: z.string().min(32),
  /** Where the app runs, e.g. http://localhost:3000. Used for Google's callback URL. */
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
