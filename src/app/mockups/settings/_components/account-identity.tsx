"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MockUser } from "../../_lib/data";

/** Name, email, and how they signed in. Nothing here is editable. */
export function AccountIdentity({
  user,
  className,
}: {
  user: MockUser;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <UserAvatar name={user.name} image={null} className="size-11" />
      <div className="min-w-0">
        <p className="truncate font-medium">{user.name}</p>
        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <GoogleIcon className="size-3.5" />
          Signed in with Google
        </p>
      </div>
    </div>
  );
}

/** Quiet on purpose: it's rarely needed and shouldn't compete with saving. */
export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={className}
      onClick={() => router.push("/mockups")}
    >
      <LogOutIcon data-icon="inline-start" />
      Sign out
    </Button>
  );
}

/** Google's "G", single-color, same as the sign-in button. */
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}
