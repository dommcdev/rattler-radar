"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { SIGN_IN_PAGE } from "@/lib/sign-in-path";

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
        errorCallbackURL: SIGN_IN_PAGE,
      });
      // Only reached if the request itself failed (e.g. the network is down);
      // on success the browser is already navigating to Google.
      if (error) setFailed(true);
    });
  }

  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className="h-10 w-full text-sm"
        onClick={signIn}
        disabled={isPending}
      >
        {isPending ? <Spinner /> : <GoogleIcon />}
        Continue with Google
      </Button>
      {failed ? (
        <p role="alert" className="text-center text-sm text-destructive">
          Couldn't reach Google. Check your connection and try again.
        </p>
      ) : null}
    </div>
  );
}

/** Google's "G" in one color (Lucide has no brand icons). */
function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      data-icon="inline-start"
    >
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}
