import type { FeedEvent } from "@/lib/events/feed-event";
import { interestLabel, MOCK_CLUB } from "../../_lib/data";

/**
 * The form state for a club event (RE-23), plus validation and the
 * conversion to a `FeedEvent` so previews can render the real `EventCard`.
 * Times are campus time. "Now" is pinned so the mockup behaves the same
 * every day.
 */

const CAMPUS_TZ = "America/Chicago";
/** November is Central Standard Time. Good enough for a mockup. */
const CAMPUS_OFFSET = "-06:00";

/** Friday, Nov 13, 2026 at 2:00 PM campus time. */
export const MOCK_NOW = new Date(`2026-11-13T14:00:00${CAMPUS_OFFSET}`);
/** `MOCK_NOW` as a date input value. */
export const TODAY = "2026-11-13";

export interface EventDraft {
  title: string;
  description: string;
  /** `yyyy-mm-dd` from a date input. */
  date: string;
  /** `hh:mm` from a time input. */
  startTime: string;
  endTime: string;
  location: string;
  interests: string[];
  /** Object URL of the uploaded flyer. */
  flyerUrl: string | null;
}

export type DraftField = keyof EventDraft;
export type DraftErrors = Partial<Record<DraftField, string>>;

export const EMPTY_DRAFT: EventDraft = {
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  interests: [],
  flyerUrl: null,
};

/** Top-to-bottom order of the fields, so we can focus the first error. */
export const FIELD_ORDER: DraftField[] = [
  "title",
  "description",
  "flyerUrl",
  "date",
  "startTime",
  "endTime",
  "location",
  "interests",
];

export const TITLE_MAX = 80;

export function validateDraft(draft: EventDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (!draft.title.trim()) {
    errors.title = "Add a title so students know what the event is.";
  } else if (draft.title.length > TITLE_MAX) {
    errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  }

  if (!draft.date) {
    errors.date = "Pick the day of the event.";
  } else if (draft.date < TODAY) {
    errors.date = "This day has already passed. Pick today or a later day.";
  }

  if (!draft.startTime) {
    errors.startTime = "Add a start time.";
  } else if (
    draft.date === TODAY &&
    toDate(draft.date, draft.startTime) <= MOCK_NOW
  ) {
    errors.startTime = `${formatTime(toDate(draft.date, draft.startTime))} has passed. Pick a later time.`;
  }

  if (draft.endTime && draft.startTime && draft.endTime <= draft.startTime) {
    errors.endTime = "End time must be after the start time.";
  }

  if (!draft.location.trim()) {
    errors.location = "Add where it is, like a building and room.";
  }

  if (draft.interests.length === 0) {
    errors.interests =
      "Pick at least one tag so the event reaches interested students.";
  }

  return errors;
}

export function firstError(errors: DraftErrors): DraftField | undefined {
  return FIELD_ORDER.find((field) => errors[field]);
}

export function toDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${CAMPUS_OFFSET}`);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: CAMPUS_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
}

function format(date: Date, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString("en-US", { timeZone: CAMPUS_TZ, ...options });
}

/** "5:00 – 7:00 PM", "11:00 AM – 1:00 PM", or just "5:00 PM". */
export function formatRange(start: Date, end: Date | null): string {
  const startText = formatTime(start);
  if (!end) return startText;
  const endText = formatTime(end);
  const startSuffix = startText.slice(-2);
  const sameHalf = startSuffix === endText.slice(-2);
  return `${sameHalf ? startText.slice(0, -3) : startText} – ${endText}`;
}

/**
 * The draft as the feed would show it. Missing pieces get gentle
 * placeholders so the preview keeps its shape while the leader types.
 */
export function draftToFeedEvent(
  draft: EventDraft,
  host: { id: string; name: string } = MOCK_CLUB,
): FeedEvent {
  const hasDate = Boolean(draft.date);
  const hasStart = hasDate && Boolean(draft.startTime);
  const start = hasDate ? toDate(draft.date, draft.startTime || "00:00") : null;
  const end =
    hasStart && draft.endTime && draft.endTime > draft.startTime
      ? toDate(draft.date, draft.endTime)
      : null;

  return {
    id: "preview",
    source: "club",
    url: "#",
    title: draft.title.trim() || "Your event title",
    startsAt: start?.toISOString() ?? MOCK_NOW.toISOString(),
    endsAt: end?.toISOString() ?? null,
    when: {
      date: start
        ? format(start, { weekday: "long", month: "long", day: "numeric" })
        : "Pick a day",
      time: hasStart && start ? formatRange(start, end) : "Add a start time",
    },
    start: {
      month: start ? format(start, { month: "short" }) : "Day",
      day: start ? format(start, { day: "numeric" }) : "–",
      time: hasStart && start ? formatTime(start) : "Time",
    },
    location: draft.location.trim() || null,
    hosts: [host],
    imageUrl: draft.flyerUrl,
    topic: null,
    categories: [],
    hasFreeFood: false,
    benefits: [],
    rsvpCount: null,
  };
}

/** "Service & volunteering and Career & networking". */
export function joinInterests(ids: string[]): string {
  const labels = ids.map(interestLabel);
  if (labels.length <= 2) return labels.join(" and ");
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

/** Made-up count of students following any of these tags. */
export function followerCount(ids: string[]): number {
  return ids.reduce((sum, id) => sum + 40 + ((id.length * 37) % 90), 0);
}
