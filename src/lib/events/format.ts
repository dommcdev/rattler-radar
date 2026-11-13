/**
 * Date formatting for events. Everything is shown in the campus time zone,
 * regardless of where the server or the visitor is.
 */
export const CAMPUS_TIME_ZONE = "America/Chicago";

const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const partsFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** { month: "Nov", day: "12", time: "5:00 PM" } */
export function formatDateParts(iso: string): {
  month: string;
  day: string;
  time: string;
} {
  const parts = Object.fromEntries(
    partsFormat.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  );
  return {
    month: parts.month,
    day: parts.day,
    time: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`,
  };
}

/** "Thu, Nov 12, 5:00 PM" */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/**
 * "Thu, Nov 12, 5:00 – 6:00 PM", or "Fri, Nov 13, 9:00 PM – Sat, Nov 14, 1:00 AM"
 * for events that span days. Falls back to the start time if there's no end.
 */
export function formatSchedule(
  startsAt: string,
  endsAt: string | null,
): string {
  if (!endsAt) return formatDateTime(startsAt);
  return dateTimeFormat.formatRange(new Date(startsAt), new Date(endsAt));
}
