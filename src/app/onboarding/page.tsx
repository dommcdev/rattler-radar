import type { Metadata } from "next";
import { Suspense } from "react";
import { InterestPicker } from "@/components/onboarding/interest-picker";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/lib/session";
import { onboardingPath, safeReturnTo } from "@/lib/sign-in-path";
import { getUserInterests } from "@/lib/user-interests";

export const metadata: Metadata = { title: "Pick interests · RattlerRadar" };

/**
 * Where new students land after their first Google sign-in (see
 * `GoogleSignInButton`). `returnTo` is where they were headed before.
 */
export default function OnboardingPage({
  searchParams,
}: PageProps<"/onboarding">) {
  return (
    <>
      <SiteHeader />
      {/* Reads the URL and session, so it renders at request time. */}
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-2xl px-4 pt-10 sm:px-6 sm:pt-14">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-10 h-48 w-full" />
          </div>
        }
      >
        <Onboarding searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Onboarding({
  searchParams,
}: {
  searchParams: PageProps<"/onboarding">["searchParams"];
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const { user } = await requireSession(onboardingPath(returnTo));
  const interests = await getUserInterests(user.id);

  return (
    <InterestPicker
      firstName={user.name.split(/\s+/)[0] ?? ""}
      initialInterests={interests}
      returnTo={returnTo}
    />
  );
}
