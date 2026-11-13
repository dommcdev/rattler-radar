import { cn } from "@/lib/utils";

/** Plain-text "RattlerRadar" wordmark (placeholder until there's a real logo). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      RattlerRadar
    </span>
  );
}
