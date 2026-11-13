import {
  CircleCheckIcon,
  GiftIcon,
  type LucideIcon,
  PizzaIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Icons for the benefits RattlerTracks offers; anything else gets a check. */
const PERK_ICONS: Record<string, { icon: LucideIcon; className?: string }> = {
  // Gold pizza slice: the same mark the homepage cards use for free food.
  "Free Food": { icon: PizzaIcon, className: "text-gold" },
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
  const { icon: Icon, className: iconClassName } = PERK_ICONS[benefit] ?? {
    icon: CircleCheckIcon,
  };
  return (
    <Icon
      aria-hidden
      className={cn("size-3.5 shrink-0", iconClassName, className)}
    />
  );
}
