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

const longDateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: "long",
  month: "long",
  day: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
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
 * { date: "Thursday, November 12", time: "5:00 – 6:00 PM" }. For events that
 * span days the time includes the end date ("9:00 PM – Sat, Nov 14, 1:00 AM"),
 * and with no end time it's just the start ("5:00 PM").
 */
export function formatWhen(
  startsAt: string,
  endsAt: string | null,
): { date: string; time: string } {
  const start = new Date(startsAt);
  const date = longDateFormat.format(start);
  if (!endsAt) return { date, time: timeFormat.format(start) };

  const end = new Date(endsAt);
  const sameDay = longDateFormat.format(end) === date;
  return {
    date,
    time: sameDay
      ? timeFormat.formatRange(start, end)
      : `${timeFormat.format(start)} – ${dateTimeFormat.format(end)}`,
  };
}
