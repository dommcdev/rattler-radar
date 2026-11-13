import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

/** Top bar. Page-specific controls (like search) are passed as children. */
export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold"
        >
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-md bg-foreground text-xs font-bold text-background"
          >
            R
          </span>
          <span className="hidden sm:inline">RattlerEvents</span>
        </Link>
        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
