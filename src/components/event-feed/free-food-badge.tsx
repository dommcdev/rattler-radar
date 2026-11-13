import { Pizza01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** A small gold pizza slice: the one bit of color on a card. */
export function FreeFoodIcon() {
  return (
    <HugeiconsIcon
      icon={Pizza01Icon}
      role="img"
      aria-label="Free food"
      className="size-3.5 shrink-0 text-gold"
      strokeWidth={2}
    />
  );
}
