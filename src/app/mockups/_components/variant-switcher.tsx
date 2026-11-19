import Link from "next/link";
import { MOCKUP_SECTIONS } from "../_lib/sections";

/**
 * Floating bar for flipping between a section's three mockups. Not part of
 * any design; it sits outside the page so it's easy to ignore.
 */
export function VariantSwitcher({
  section,
  variant,
}: {
  section: string;
  variant: "a" | "b" | "c";
}) {
  const current = MOCKUP_SECTIONS.find((item) => item.id === section);
  if (!current) return null;
  const note = current.variants[variant];

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden">
      <div className="flex max-w-full items-center gap-3 rounded-full border bg-background/95 py-1 pr-1 pl-4 text-sm shadow-lg backdrop-blur">
        <Link
          href="/mockups"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          Mockups
        </Link>
        <span className="shrink-0 font-medium">{current.title}</span>
        <span className="hidden min-w-0 truncate text-muted-foreground lg:inline">
          {note}
        </span>
        <nav className="flex shrink-0 gap-0.5" aria-label="Variants">
          {(["a", "b", "c"] as const).map((id) => (
            <Link
              key={id}
              href={`/mockups/${section}/${id}`}
              aria-current={id === variant ? "page" : undefined}
              className="grid size-7 place-items-center rounded-full text-xs font-semibold text-muted-foreground uppercase hover:bg-muted aria-[current=page]:bg-foreground aria-[current=page]:text-background"
            >
              {id}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
