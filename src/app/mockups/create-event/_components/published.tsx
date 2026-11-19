import { CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { BIG_BUTTON, BIG_OUTLINE_BUTTON } from "./styles";

/**
 * After publishing: what happened, where it went, and the obvious next
 * step (see it live). The heading matches the button that got us here.
 */
export function Published({
  title,
  children,
  viewLabel,
  againLabel,
  onAgain,
  preview,
  headingLevel = "h2",
}: {
  /** "Event published" or "Activity posted". */
  title: string;
  /** Where it shows up now. */
  children: ReactNode;
  viewLabel: string;
  againLabel: string;
  onAgain: () => void;
  /** Optional card of the published thing. */
  preview?: ReactNode;
  /** "h1" when the success state is all that's left on the page. */
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <div className="flex flex-col items-start gap-5" aria-live="polite">
      <div className="flex items-start gap-3">
        <CircleCheckIcon className="mt-0.5 size-6 shrink-0 text-primary dark:text-foreground" />
        <div className="space-y-1">
          <Heading className="text-xl font-semibold tracking-tight">
            {title}
          </Heading>
          <div className="text-[15px] leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
      {preview ? (
        // inert: a picture of the card; "View event" is the way in.
        <div inert className="w-full max-w-sm">
          {preview}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Link href="#" className={BIG_BUTTON}>
          {viewLabel}
        </Link>
        <Button
          variant="outline"
          className={BIG_OUTLINE_BUTTON}
          onClick={onAgain}
        >
          {againLabel}
        </Button>
      </div>
    </div>
  );
}
