import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

/**
 * The home page is the personal feed, so visitors without a session cookie
 * go straight to all events. This only checks that the cookie exists (it's
 * fast, with no database call); the home page itself checks the session
 * properly and redirects too if it turns out to be invalid.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/events", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: "/" };
