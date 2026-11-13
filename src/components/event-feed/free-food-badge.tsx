import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

/** A small gold star: the one bit of color on a card. */
export function FreeFoodIcon() {
  return (
    <HugeiconsIcon
      icon={StarIcon}
      role="img"
      aria-label="Free food"
      className="size-3.5 shrink-0 fill-gold text-gold"
      strokeWidth={2}
    />
  );
}

/** The star with a "Free food" label, for places with room to spell it out. */
export function FreeFoodBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <FreeFoodIcon />
      Free food
    </span>
  );
}
