import {
  CheckmarkCircle02Icon,
  GiftIcon,
  Pizza01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type Icon = typeof GiftIcon;

/** Icons for the benefits RattlerTracks offers; anything else gets a check. */
const PERK_ICONS: Record<string, { icon: Icon; className?: string }> = {
  // Gold pizza slice: the same mark the homepage cards use for free food.
  "Free Food": { icon: Pizza01Icon, className: "text-gold" },
  "Free Stuff": { icon: GiftIcon },
};

/** "Free Stuff" -> "Free stuff", matching the site's sentence case. */
export function perkLabel(benefit: string): string {
  return benefit.charAt(0) + benefit.slice(1).toLowerCase();
}

export function PerkIcon({
  benefit,
  className,
}: {
  benefit: string;
  className?: string;
}) {
  const { icon, className: iconClassName } = PERK_ICONS[benefit] ?? {
    icon: CheckmarkCircle02Icon,
  };
  return (
    <HugeiconsIcon
      icon={icon}
      aria-hidden
      strokeWidth={2}
      className={cn("size-3.5 shrink-0", iconClassName, className)}
    />
  );
}
