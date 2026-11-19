/**
 * Helpers shared by the three "For you" mockups: which events match the
 * student, why, and how to group them by when they happen.
 */
import { CAMPUS_TIME_ZONE } from "@/lib/events/format";
import {
  interestLabel,
  MOCK_QUICK_ACTIVITIES,
  type QuickActivity,
} from "../../_lib/data";
import type { MockEvent } from "../../_lib/get-mock-events";

/**
 * "Now" for the mockups (Friday, Nov 13, 1:30 PM campus time), so the
 * Today / This weekend groups stay put no matter when someone looks.
 */
export const MOCK_NOW = Date.parse("2026-11-13T19:30:00.000Z");

/** Student-posted activities, minus the one an admin is reviewing as spam. */
export const QUICK_ACTIVITIES: QuickActivity[] = [
  ...MOCK_QUICK_ACTIVITIES.filter((activity) => activity.id !== "q-7"),
  {
    id: "q-8",
    title: "Board games in the Marian Hall lounge",
    startsAt: "2026-11-14T02:00:00.000Z",
    location: "Marian Hall lounge",
    postedBy: "Kayla Brooks",
    joinedCount: 2,
  },
].toSorted((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

/** The student's interests this event matches, in the student's order. */
export function matchedInterests(event: MockEvent, interests: string[]) {
  return interests.filter((id) => event.interests.includes(id));
}

/** RE-13: events matching at least one interest, or everything if none. */
export function forYouEvents(events: MockEvent[], interests: string[]) {
  if (interests.length === 0) return events;
  return events.filter(
    (event) => matchedInterests(event, interests).length > 0,
  );
}

/** "Pre-Law, Intramural sports, and Socials & parties", for sentences. */
export function joinLabels(ids: string[]): string {
  const labels = ids.map(interestLabel);
  if (labels.length <= 1) return labels.join("");
  if (labels.length === 2) return labels.join(" and ");
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

/** "For Pre-Law, Socials & parties": why an event is in the feed. */
export function reasonText(ids: string[]): string {
  return `For ${ids.map(interestLabel).join(", ")}`;
}

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAMPUS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});
const longDayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

/** Whole days between two instants, in campus time (0 = same day). */
function daysFromNow(iso: string): number {
  const day = (ms: number) => Date.parse(dayKeyFormat.format(ms));
  return Math.round((day(Date.parse(iso)) - day(MOCK_NOW)) / 86_400_000);
}

/** "4:30 PM" */
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso));
}

/** "Friday, November 13" */
export function formatLongDay(iso: string): string {
  return longDayFormat.format(new Date(iso));
}

/** "in 30 min", "in 2 hr", or null if it already started or is later on. */
export function startsIn(iso: string): string | null {
  const minutes = Math.round((Date.parse(iso) - MOCK_NOW) / 60_000);
  if (minutes <= 0) return null;
  if (minutes < 60) return `in ${minutes} min`;
  if (minutes < 6 * 60) return `in ${Math.round(minutes / 60)} hr`;
  return null;
}

export type WhenGroupId = "today" | "week" | "next-week" | "later";

export function isToday(iso: string): boolean {
  return daysFromNow(iso) === 0;
}

/** Today, then the rest of this week (to Sunday), next week, and later. */
export function whenGroup(iso: string): WhenGroupId {
  const days = daysFromNow(iso);
  // Day of week for "now": 0 Sunday … 6 Saturday. Mock now is a Friday.
  const weekday = new Date(MOCK_NOW - 6 * 3_600_000).getUTCDay();
  const daysLeftThisWeek = weekday === 0 ? 0 : 7 - weekday;
  if (days <= 0) return "today";
  if (days <= daysLeftThisWeek) return "week";
  if (days <= daysLeftThisWeek + 7) return "next-week";
  return "later";
}

export function whenGroupLabel(id: WhenGroupId): string {
  const weekday = new Date(MOCK_NOW - 6 * 3_600_000).getUTCDay();
  const weekend = weekday === 0 || weekday >= 5;
  return {
    today: "Today",
    week: weekend ? "This weekend" : "This week",
    "next-week": "Next week",
    later: "Later",
  }[id];
}

/** Events split into Today / This week / Next week / Later, empty groups dropped. */
export function groupByWhen<T extends { startsAt: string }>(items: T[]) {
  const order: WhenGroupId[] = ["today", "week", "next-week", "later"];
  return order
    .map((id) => ({
      id,
      label: whenGroupLabel(id),
      items: items.filter((item) => whenGroup(item.startsAt) === id),
    }))
    .filter((group) => group.items.length > 0);
}

/** Items split by campus day, for agenda views. */
export function groupByDay<T extends { startsAt: string }>(items: T[]) {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKeyFormat.format(new Date(item.startsAt));
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([key, dayItems]) => {
    const first = dayItems[0].startsAt;
    const days = daysFromNow(first);
    return {
      key,
      label:
        days === 0
          ? "Today"
          : days === 1
            ? "Tomorrow"
            : formatLongDay(first).split(",")[0],
      date: formatLongDay(first).split(", ")[1],
      items: dayItems,
    };
  });
}
