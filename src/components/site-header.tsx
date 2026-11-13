import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { UserMenu, UserMenuFallback } from "@/components/auth/user-menu";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

/** Top bar. Page-specific controls (like search) are passed as children. */
export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0 text-sm">
          <Logo />
        </Link>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          {children}
          <ThemeToggle />
          {/* The only part of the header that depends on who's visiting. */}
          <Suspense fallback={<UserMenuFallback />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
