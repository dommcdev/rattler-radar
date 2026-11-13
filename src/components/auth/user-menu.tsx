import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";
import { AccountMenu } from "./account-menu";

/**
 * The header's account area: "Sign in" for visitors, the account menu once
 * signed in. It reads the session, so it streams in behind <Suspense> while
 * the rest of the page stays static; use <UserMenuFallback> as the fallback.
 */
export async function UserMenu() {
  const session = await getSession();

  if (!session) {
    return (
      <Button asChild size="lg">
        <Link href="/sign-in">Sign in</Link>
      </Button>
    );
  }

  const { name, email, image } = session.user;
  return <AccountMenu name={name} email={email} image={image} />;
}

/** Same size as the avatar, so nothing shifts when the real menu arrives. */
export function UserMenuFallback() {
  return <Skeleton className="size-7 rounded-full" />;
}
