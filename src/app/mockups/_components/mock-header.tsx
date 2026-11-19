import Link from "next/link";
import type { ReactNode } from "react";
import { UserAvatar } from "@/components/auth/user-avatar";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { MockUser } from "../_lib/data";

export interface MockNavItem {
  label: string;
  href: string;
}

/** What each role sees in the header (RE-20). */
export const NAV_BY_ROLE: Record<MockUser["role"], MockNavItem[]> = {
  student: [
    { label: "Events", href: "/" },
    { label: "For you", href: "#" },
  ],
  leader: [
    { label: "Events", href: "/" },
    { label: "For you", href: "#" },
    { label: "My events", href: "#" },
  ],
  admin: [
    { label: "Events", href: "/" },
    { label: "Admin", href: "#" },
  ],
};

/**
 * The real `SiteHeader`, but signed in as a fake user so mockups don't need a
 * session. Pass `nav` to show page links; `active` is the current label.
 * Page-specific controls go in `children`, like the real header.
 */
export function MockHeader({
  user,
  nav,
  active,
  children,
  wide = true,
}: {
  user?: MockUser;
  nav?: MockNavItem[];
  active?: string;
  children?: ReactNode;
  /** Match the feed's 1400px width; false uses 1100px like the event page. */
  wide?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div
        className={cn(
          "mx-auto flex h-14 items-center gap-4 px-4 sm:px-6",
          wide ? "max-w-[1400px]" : "max-w-[1100px]",
        )}
      >
        <Link href="/" className="shrink-0 text-sm">
          <Logo />
        </Link>
        {nav ? (
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.label === active ? "page" : undefined}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          {children}
          <ThemeToggle />
          {user ? <UserAvatar name={user.name} image={null} /> : null}
        </div>
      </div>
    </header>
  );
}
