# Mockup brief (shared by every section)

RattlerRadar is a campus event hub for St. Mary's University (San Antonio,
mascot: Rattlers). Students find events synced from RattlerTracks (the
school's clunky official portal); club leaders publish their own events; admins
keep the feed trustworthy. Most students use it on their phones between
classes. The product goal: help them find the few events they care about
without wading through campus noise.

## What already exists (study these before designing)

- `src/app/page.tsx` + `src/components/event-feed/*`: the global feed. Header
  with search, "Upcoming events" h1 + count + "updated" note, pill filters,
  grid of `EventCard`s (5:3 flyer, then a month/day date stamp beside the
  title, one quiet muted line with time and place, gold pizza for free food).
- `src/app/events/[id]/page.tsx` + `src/components/event-page/*`: event page.
  Big title, "Hosted by", flyer, sticky details card (calendar tile, where,
  RSVP button, add to calendar), perk pills.
- `src/app/sign-in/page.tsx`, `src/app/account/page.tsx`.
- `src/app/globals.css`: tokens. `src/components/ui/*`: shadcn on Base UI
  (NOT Radix: Base UI uses `render` props instead of `asChild`; read each
  component file before using it). Icons: lucide-react.

## Visual language to keep (this is the existing style; don't reinvent it)

- Inter only. Calm neutral surfaces, hairline borders, `rounded-lg` on
  containers and `rounded-md` on flyers and inputs, `rounded-full` pills.
- Page h1: `text-2xl font-semibold tracking-tight` (event page uses
  3xl/4xl for a single hero title). Section headings: `font-semibold
  tracking-tight` at base or lg. Secondary labels: `text-sm font-medium
  text-muted-foreground`. Body 14 to 15px. `tabular-nums` for numbers.
- Color: navy `primary` (#003366) only for the single primary action on a
  screen. `gold` is reserved for free food; don't use it for anything else.
  `destructive` only for destructive actions and errors. Everything else is
  neutral. No gradients, no colored card backgrounds, no decorative shadows.
- Recurring motifs worth reusing: the date stamp from `event-card.tsx`, the
  calendar tile from `event-details-card.tsx`, the pill toggle style from
  `event-feed-filters.tsx`, the `Empty` component for empty states.
- Widths: feed pages `max-w-[1400px]`, focused pages `max-w-[1100px]`,
  forms/settings `max-w-2xl` or narrower. Padding `px-4 sm:px-6`.
- Must work in light AND dark mode (the user's system is dark) and on a
  390px-wide phone. Visible keyboard focus. Respect reduced motion.

## What the user asked for

Clean, intuitive, strong visual hierarchy. One obvious primary action per
screen. Group related things; separate unrelated things with space before
borders. Prefer lists with dividers and plain layout over boxes-in-boxes; use
cards only when a thing really is a separate object. Don't chop everything
into identical rounded cards.

Avoid these generic tells: all-caps eyebrow labels above headings, numbered
markers (01/02/03) unless the content truly is a sequence, "→" on buttons,
middle-dot meta strings everywhere (the feed's single "time · place" line is
fine), monospace data labels, gradient washes, stat-tile rows of big numbers
with tiny labels unless numbers are truly the point, emoji.

## Copy

Plain, specific, sentence case, written for students (or the club leader or
admin). Active-voice buttons that say exactly what happens ("Save interests",
"Cancel event", "Remove listing"); keep an action's name the same through the
flow (button "Remove listing" -> toast/confirmation "Listing removed").
Errors say what happened and how to fix it. Empty states invite action.

## Mechanics

- Route files: `src/app/mockups/<section>/{a,b,c}/page.tsx`. Put
  section-specific components in `src/app/mockups/<section>/_components/`.
  Do not touch files outside your section folder, except you may read
  anything. Do NOT edit `src/components/ui/*`, `_lib/*`, or `_components/*`.
- Shared mock data: `src/app/mockups/_lib/data.ts` (users, interests, club,
  organizer events, reports, quick activities, sync runs). Real events with
  mock interest tags: `getMockEvents()` from `_lib/get-mock-events.ts`
  (server-only, cached; call it in a server component and pass data down).
  Add section-only fake data in your own folder if you need more.
- Every page renders `<MockHeader>` (from `../../_components/mock-header`,
  with `user`, `nav={NAV_BY_ROLE[role]}`, `active`) at the top and
  `<VariantSwitcher section="<section>" variant="a" />` at the bottom. Leave
  `pb-24` or so at the bottom so the switcher doesn't cover content.
- Fill in `src/app/mockups/<section>/_variants.ts` with one short sentence per
  variant describing its idea (shown in the switcher and the index).
- Make the mockups interactive with client state where it helps judge the
  design (toggling interests, opening a confirm dialog, switching tabs,
  validation errors on submit). Nothing persists.
- This Next.js has `cacheComponents: true`. Reading request data (cookies,
  headers, searchParams) needs `<Suspense>`; avoid it. `"use client"`
  components are fine. Next 16 docs: `node_modules/next/dist/docs/`.
- Dev server is already running at http://localhost:3000 (don't start
  another). Check types with `npx tsc --noEmit -p .` and lint your folder with
  `npx biome check src/app/mockups/<section>`.
- Review your work visually with agent-browser. Use your own session:
  `export AGENT_BROWSER_SESSION=mock-<section>`. Screenshot at 1440x900 and
  390x844, light and dark (`agent-browser set media dark|light` or the theme
  toggle). Save screenshots to the scratchpad dir you're given and look at
  them with the Read tool. Critique against this brief and iterate. Close
  your session when done.
- The three variants must be genuinely different directions (different
  layout/interaction model), not color swaps. Each should be a credible
  answer someone could pick and ship.
