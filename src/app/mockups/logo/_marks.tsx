/**
 * Candidate RattlerRadar marks. Each one is a rattlesnake rattle that also
 * reads a little like radar. `main` colors the body, `accent` the highlight.
 */

export interface MarkProps {
  main: string;
  accent: string;
  className?: string;
  size?: number;
}

function Svg({
  className,
  size,
  children,
}: {
  className?: string;
  size?: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
    >
      {children}
    </svg>
  );
}

/** 1. The current mark, cleaned up: stacked segments, gold tip. */
export function StackedMark({ main, accent, className, size }: MarkProps) {
  return (
    <Svg className={className} size={size}>
      <g transform="rotate(30 16 16)">
        <rect x="7" y="22" width="18" height="8" rx="4" fill={main} />
        <rect x="9" y="14.5" width="14" height="6.5" rx="3.25" fill={main} />
        <rect x="11" y="8" width="10" height="5.5" rx="2.75" fill={main} />
        <rect x="13" y="2.5" width="6" height="4.5" rx="2.25" fill={accent} />
      </g>
    </Svg>
  );
}

/** 2. Ripple: nested rings that read as rattle segments and radar pings. */
export function RippleMark({ main, accent, className, size }: MarkProps) {
  // Circles internally tangent at the tip (26, 6), growing toward the body.
  const ring = (r: number) => ({
    cx: 26 - Math.SQRT1_2 * r,
    cy: 6 + Math.SQRT1_2 * r,
    r,
  });
  return (
    <Svg className={className} size={size}>
      <g fill="none" stroke={main}>
        <circle {...ring(14)} strokeWidth="3.5" />
        <circle {...ring(8.5)} strokeWidth="3" />
      </g>
      <circle {...ring(3.5)} fill={accent} />
    </Svg>
  );
}

/** 3. Beam: a radar beam sliced into rattle segments. */
export function BeamMark({ main, accent, className, size }: MarkProps) {
  return (
    <Svg className={className} size={size}>
      <g fill={main} stroke={main} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M16.11 24.02 A11.5 11.5 0 0 0 7.98 15.89 L6.94 19.76 A7.5 7.5 0 0 1 12.24 25.06 Z" />
        <path d="M22.39 22.34 A18 18 0 0 0 9.66 9.61 L8.49 13.96 A13.5 13.5 0 0 1 18.04 23.51 Z" />
        <path d="M29.15 20.53 A25 25 0 0 0 11.47 2.85 L10.18 7.68 A20 20 0 0 1 24.32 21.82 Z" />
      </g>
      <circle cx="5" cy="27" r="3.25" fill={accent} />
    </Svg>
  );
}

/** 4. Buzz: a short rattle with radar waves coming off the tip. */
export function BuzzMark({ main, accent, className, size }: MarkProps) {
  return (
    <Svg className={className} size={size}>
      <g transform="rotate(40 16 16)">
        <rect x="10.5" y="23" width="11" height="6" rx="3" fill={main} />
        <rect
          x="11.75"
          y="17.5"
          width="8.5"
          height="4.5"
          rx="2.25"
          fill={main}
        />
        <rect x="13" y="13" width="6" height="3.5" rx="1.75" fill={main} />
        <g fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
          <path d="M12.46 9.46 A5 5 0 0 1 19.54 9.46" />
          <path d="M9.28 6.28 A9.5 9.5 0 0 1 22.72 6.28" />
        </g>
      </g>
    </Svg>
  );
}

/** 5. Scope: a radar scope whose sweep line is a rattle. */
export function ScopeMark({ main, accent, className, size }: MarkProps) {
  return (
    <Svg className={className} size={size}>
      <path
        d="M16 16 L16 2.5 A13.5 13.5 0 0 1 27.69 9.25 Z"
        fill={accent}
        opacity="0.45"
      />
      <circle
        cx="16"
        cy="16"
        r="13.5"
        fill="none"
        stroke={main}
        strokeWidth="2.5"
      />
      <g transform="rotate(30 16 16)" fill={main}>
        <rect x="12.5" y="12.5" width="7" height="7" rx="3.5" />
        <rect x="13.25" y="7.75" width="5.5" height="4" rx="2" />
        <rect x="14" y="4" width="4" height="3" rx="1.5" fill={accent} />
      </g>
    </Svg>
  );
}

export const MARKS = [
  {
    id: "stacked",
    name: "Stacked",
    note: "Current mark, cleaned up",
    Mark: StackedMark,
  },
  {
    id: "ripple",
    name: "Ripple",
    note: "Nested rings: rattle segments or radar pings",
    Mark: RippleMark,
  },
  {
    id: "beam",
    name: "Beam",
    note: "Radar beam cut into segments",
    Mark: BeamMark,
  },
  {
    id: "buzz",
    name: "Buzz",
    note: "Rattle giving off a signal",
    Mark: BuzzMark,
  },
  {
    id: "scope",
    name: "Scope",
    note: "Rattle as the sweep line",
    Mark: ScopeMark,
  },
] as const;
