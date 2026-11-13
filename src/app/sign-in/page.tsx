import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";
import { safeReturnTo } from "@/lib/sign-in-path";

export const metadata: Metadata = { title: "Sign in · RattlerEvents" };

/** Better Auth's error codes for failed Google sign-ins, in plain language. */
const SIGN_IN_ERRORS: Record<string, string> = {
  access_denied: "Signing in with Google was cancelled.",
};
const DEFAULT_SIGN_IN_ERROR = "Something went wrong signing in with Google.";

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <>
      <SiteHeader />
      <main className="grid place-items-center px-4 py-16 sm:py-24">
        <Card className="w-full max-w-sm gap-6 p-6">
          <CardHeader className="gap-1.5 p-0">
            <CardTitle className="text-lg font-semibold tracking-tight">
              Sign in to RattlerEvents
            </CardTitle>
            <CardDescription className="text-sm">
              Use your Google account to save interests and see events picked
              for you.
            </CardDescription>
          </CardHeader>
          {/* Reads the URL and session, so it renders at request time. */}
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <SignInOptions searchParams={searchParams} />
          </Suspense>
        </Card>
      </main>
    </>
  );
}

async function SignInOptions({
  searchParams,
}: {
  searchParams: PageProps<"/sign-in">["searchParams"];
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);

  // Already signed in: nothing to do here.
  if (await getSession()) redirect(returnTo);

  const error = typeof params.error === "string" ? params.error : null;

  return (
    <CardContent className="space-y-4 p-0">
      {error ? (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} />
          <AlertTitle>
            {SIGN_IN_ERRORS[error] ?? DEFAULT_SIGN_IN_ERROR}
          </AlertTitle>
          <AlertDescription>Please try again.</AlertDescription>
        </Alert>
      ) : null}
      <GoogleSignInButton returnTo={returnTo} />
    </CardContent>
  );
}
