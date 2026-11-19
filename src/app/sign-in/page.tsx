import { TriangleAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Logo } from "@/components/logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";
import { safeReturnTo } from "@/lib/sign-in-path";

export const metadata: Metadata = { title: "Sign in · RattlerRadar" };

/** Better Auth's error codes for failed Google sign-ins, in plain language. */
const SIGN_IN_ERRORS: Record<string, string> = {
  access_denied: "Signing in with Google was cancelled.",
};
const DEFAULT_SIGN_IN_ERROR = "Something went wrong signing in with Google.";

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 pb-[10vh]">
      <div className="flex w-full max-w-sm flex-col items-center gap-10">
        <Link href="/" aria-label="RattlerRadar home">
          <Logo className="text-3xl" />
        </Link>
        {/* Reads the URL and session, so it renders at request time. */}
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <SignInOptions searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
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
    <div className="flex w-full flex-col gap-4">
      {error ? (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>
            {SIGN_IN_ERRORS[error] ?? DEFAULT_SIGN_IN_ERROR}
          </AlertTitle>
          <AlertDescription>Please try again.</AlertDescription>
        </Alert>
      ) : null}
      <GoogleSignInButton returnTo={returnTo} />
      <p className="text-center text-sm text-muted-foreground">
        Sign in to save interests and see events picked for you.
      </p>
    </div>
  );
}
