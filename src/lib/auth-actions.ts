"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Ends the session in the database and clears its cookie (the `nextCookies`
 * plugin lets Better Auth set cookies from a server action), then goes home.
 */
export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
