"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { onboardingPath, SIGN_IN_PAGE } from "@/lib/sign-in-path";

/**
 * Starts Google sign-in. On success the browser goes to Google and back to
 * `returnTo`. If Google reports a problem, Better Auth sends the visitor back
 * to the sign-in page with an `error` parameter, which the page explains.
 */
export function GoogleSignInButton({ returnTo }: { returnTo: string }) {
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function signIn() {
    setFailed(false);
    startTransition(async () => {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: returnTo,
        // First sign-in creates the account: pick interests, then continue.
        newUserCallbackURL: onboardingPath(returnTo),
        errorCallbackURL: SIGN_IN_PAGE,
      });
      // Only reached if the request itself failed (e.g. the network is down);
      // on success the browser is already navigating to Google.
      if (error) setFailed(true);
    });
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-10 w-full gap-2 text-sm"
        type="button"
        onClick={signIn}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : <GoogleIcon />}
        Continue with Google
      </Button>
      {failed ? (
        <FieldError className="text-center">
          Couldn't reach Google. Check your connection and try again.
        </FieldError>
      ) : null}
    </>
  );
}

/** Google's full-color "G" (Lucide has no brand icons). */
function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.44.35-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
