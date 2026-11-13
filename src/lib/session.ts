import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth, type Session } from "@/lib/auth";
import { signInPath } from "@/lib/sign-in-path";

/**
 * The one place pages and server actions read the signed-in user from (the
 * "data access layer" pattern in the Next.js auth guide). Reading the session
 * reads the request, so components that call these must sit inside <Suspense>.
 */
export async function getSession(): Promise<Session | null> {
  // Sessions are checked against the current time, so they must be read at
  // request time, never prerendered.
  await connection();
  return auth.api.getSession({ headers: await headers() });
}

/**
 * For account-only pages: returns the session, or sends the visitor to sign
 * in and brings them back to `returnTo` afterwards.
 */
export async function requireSession(returnTo: string): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(signInPath(returnTo));
  return session;
}
