"use client";

import { GoogleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
        {isPending ? (
          <Spinner />
        ) : (
          <HugeiconsIcon icon={GoogleIcon} data-icon="inline-start" />
        )}
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
