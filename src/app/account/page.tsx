import type { Metadata } from "next";
import { Suspense } from "react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/lib/auth-actions";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Account · RattlerEvents" };

/**
 * Account-only. Interests and notification
 * settings (RE-13, RE-21) will live here.
 */
export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <Suspense fallback={<Skeleton className="mt-6 h-40 w-full" />}>
          <AccountDetails />
        </Suspense>
      </main>
    </>
  );
}

async function AccountDetails() {
  const { user } = await requireSession("/account");

  return (
    <section className="mt-6 rounded-lg border">
      <div className="flex items-center gap-4 p-5">
        <UserAvatar name={user.name} image={user.image} className="size-12" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <dl className="divide-y border-t text-sm">
        <div className="grid grid-cols-[8rem_1fr] gap-3 px-5 py-3">
          <dt className="text-muted-foreground">Signed in with</dt>
          <dd>Google</dd>
        </div>
      </dl>
      <form action={signOut} className="border-t p-5">
        <Button type="submit" variant="outline" size="lg">
          Sign out
        </Button>
      </form>
    </section>
  );
}
