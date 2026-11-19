import { CAMPUS_TIME_ZONE, formatDateParts } from "@/lib/events/format";
import { MOCK_ORGANIZER_EVENTS, type OrganizerEvent } from "../../_lib/data";

/** The mockups pretend it's this moment, so "upcoming" never drifts. */
export const MOCK_NOW = new Date("2026-11-13T18:00:00.000Z");

/** An organizer event with the extra fields the edit form needs. */
export interface MyEvent extends OrganizerEvent {
  description: string;
  /** Where synced events are edited (their RattlerTracks page). */
  rattlerTracksUrl: string | null;
}

const DESCRIPTIONS: Record<string, string> = {
  "m-101":
    "Help us kick off this year's coat drive. We'll sort donations, make collection-box signs, and split up dorm drop-off shifts. Bring any coats you can spare.",
  "12966502":
    "Dunk your favorite Rattler leaders for a good cause. $1 a throw, all proceeds go to Rotaract's holiday service projects.",
  "m-102":
    "Members of Rotary San Antonio will review resumes one-on-one and share what they look for when hiring. Bring a printed copy.",
  "m-103":
    "Three-hour sorting shift at the San Antonio Food Bank. Carpools leave from the University Center at 8:30 AM.",
  "m-099":
    "Meet the officers, hear the plan for the semester, and sign up for committees.",
};

export const INITIAL_EVENTS: MyEvent[] = MOCK_ORGANIZER_EVENTS.map((event) => ({
  ...event,
  description: DESCRIPTIONS[event.id] ?? "",
  rattlerTracksUrl:
    event.source === "rattlertracks"
      ? `https://stmarytx.campuslabs.com/engage/event/${event.id}`
      : null,
}));

export const CREATE_EVENT_HREF = "/mockups/create-event/a";

export function isUpcoming(event: MyEvent): boolean {
  return event.status === "published" && new Date(event.startsAt) > MOCK_NOW;
}

export function isPast(event: MyEvent): boolean {
  return (
    event.status === "past" ||
    (event.status === "published" && new Date(event.startsAt) <= MOCK_NOW)
  );
}

export function groupEvents(events: MyEvent[]) {
  const byStart = (a: MyEvent, b: MyEvent) =>
    a.startsAt.localeCompare(b.startsAt);
  return {
    upcoming: events.filter(isUpcoming).sort(byStart),
    past: events.filter(isPast).sort((a, b) => byStart(b, a)),
    cancelled: events
      .filter((event) => event.status === "cancelled")
      .sort(byStart),
  };
}

/** "18 going", "1 going", or null when nobody has RSVP'd. */
export function goingLabel(count: number | null): string | null {
  return count ? `${count} going` : null;
}

// Values for the form's native date and time inputs, in campus time.
const inputDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAMPUS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const inputTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: CAMPUS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function toDateInput(iso: string): string {
  return inputDate.format(new Date(iso));
}

export function toTimeInput(iso: string | null): string {
  return iso ? inputTime.format(new Date(iso)) : "";
}

/**
 * Back from campus date + time to ISO. Mock-only shortcut: every mock event
 * falls in Central Standard Time (UTC-6), so the offset is fixed.
 */
export function fromInputs(date: string, time: string): string {
  return new Date(`${date}T${time}:00-06:00`).toISOString();
}

/** "Fri, Nov 20" */
export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

/** "Wed, 10:00 AM – 1:00 PM" */
export function dayAndTime(
  event: Pick<MyEvent, "startsAt" | "endsAt">,
): string {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: "short",
  }).format(new Date(event.startsAt));
  return `${weekday}, ${timeRange(event.startsAt, event.endsAt)}`;
}

/**
 * "5:00 – 7:00 PM". Built by hand rather than with `formatRange`, whose
 * spacing differs between Node and browsers (a hydration mismatch).
 */
export function timeRange(startsAt: string, endsAt: string | null): string {
  const start = formatDateParts(startsAt).time;
  if (!endsAt) return start;
  const end = formatDateParts(endsAt).time;
  const [startClock, startPeriod] = start.split(" ");
  const endPeriod = end.split(" ")[1];
  return startPeriod === endPeriod
    ? `${startClock} – ${end}`
    : `${start} – ${end}`;
}

/** "In 5 days", "Tomorrow", "Today" relative to `MOCK_NOW`, in campus days. */
export function relativeDay(iso: string): string {
  const day = (d: Date) => new Date(inputDate.format(d)).getTime();
  const diff = Math.round((day(new Date(iso)) - day(MOCK_NOW)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return `In ${diff} days`;
  if (diff < 14) return "Next week";
  return `In ${Math.round(diff / 7)} weeks`;
}
