/**
 * The sign-in page's URL parameters:
 * - `returnTo`: where to go after signing in (an internal path only)
 * - `error`: set by Better Auth when Google sign-in fails
 */

export const SIGN_IN_PAGE = "/sign-in";

export function signInPath(returnTo = "/"): string {
  if (returnTo === "/") return SIGN_IN_PAGE;
  return `${SIGN_IN_PAGE}?${new URLSearchParams({ returnTo })}`;
}

/** Onboarding, for new accounts; continues to `returnTo` when done. */
export function onboardingPath(returnTo = "/"): string {
  if (returnTo === "/") return "/onboarding";
  return `/onboarding?${new URLSearchParams({ returnTo })}`;
}

/**
 * Only allows paths on this site, so a crafted link can't use sign-in to
 * send someone to another website after they log in.
 */
export function safeReturnTo(value: string | string[] | undefined): string {
  if (typeof value !== "string") return "/";
  const isInternalPath =
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\");
  return isInternalPath ? value : "/";
}
