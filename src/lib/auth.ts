// Server-only (it reads secrets and opens the database), but it can't import
// "server-only": the Better Auth CLI loads this file outside Next.js to
// generate the database schema.
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db/client";
import { env } from "@/lib/env";

/**
 * Better Auth with Google sign-in only, using Better Auth's and Google's
 * defaults. Sessions are stored in the database and last 7 days, extended
 * automatically while the student keeps using the app.
 */
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  // Lets server actions (like sign out) set cookies. Must be the last plugin.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
