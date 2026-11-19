import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";

/** The primary action's size on these forms: a step up from `lg`. */
export const BIG_BUTTON = cn(
  buttonVariants({ size: "lg" }),
  "h-9 px-4 text-sm",
);

export const BIG_OUTLINE_BUTTON = cn(
  buttonVariants({ size: "lg", variant: "outline" }),
  "h-9 px-4 text-sm",
);
