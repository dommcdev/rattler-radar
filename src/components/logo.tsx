import { cn } from "@/lib/utils";

/**
 * The RattlerRadar mark: a rattlesnake's rattle, segments shrinking toward the
 * tip. St. Mary's blue with a gold tip; gold with a white tip in dark mode,
 * since the blue is too dark to read on black.
 *
 * Keep in sync with src/app/icon.svg (the favicon).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      // Cropped to the rotated artwork so there's no empty space around it.
      viewBox="2.2 3.2 22.8 28.4"
      aria-hidden="true"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      <g
        transform="rotate(30 16 16)"
        className="fill-stmu-blue dark:fill-stmu-gold"
      >
        <rect x="7" y="22" width="18" height="8" rx="4" />
        <rect x="9" y="14.5" width="14" height="6.5" rx="3.25" />
        <rect x="11" y="8" width="10" height="5.5" rx="2.75" />
        <rect
          x="13"
          y="2.5"
          width="6"
          height="4.5"
          rx="2.25"
          className="fill-stmu-gold dark:fill-white"
        />
      </g>
    </svg>
  );
}

/** Mark plus "RattlerRadar" wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-2xl font-bold tracking-tight",
        className,
      )}
    >
      {/* About the height of the letters, so the text never looks smaller. */}
      <LogoMark className="h-[0.8em]" />
      <span>
        Rattler
        <span className="text-stmu-blue dark:text-stmu-gold">Radar</span>
      </span>
    </span>
  );
}
