import type { FeedEvent } from "./feed-event";

const CAMPUS = "St. Mary's University, San Antonio, TX";
/** Assumed length of events RattlerTracks lists without an end time. */
const DEFAULT_DURATION_MS = 60 * 60 * 1000;

/** Google Maps search for the event's room on campus. */
export function directionsUrl(location: string): string {
  const query = encodeURIComponent(`${location}, ${CAMPUS}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** Google Calendar "add event" link, prefilled with the event's details. */
export function googleCalendarUrl(event: FeedEvent): string {
  const start = new Date(event.startsAt);
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(start.getTime() + DEFAULT_DURATION_MS);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${calendarTime(start)}/${calendarTime(end)}`,
    details: event.url,
    location: event.location ? `${event.location}, ${CAMPUS}` : CAMPUS,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** 2026-11-18T00:00:00.000Z -> 20261118T000000Z */
function calendarTime(date: Date): string {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
}
