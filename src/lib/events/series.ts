/**
 * RattlerTracks has no idea of a recurring event, so we work it out: events
 * with the same hosts and the same title once numbers, dates, and
 * punctuation are removed belong to one series. "HRBLS 3rd General Meeting"
 * and "HRBLS 4th General Meeting" share a key; so do "Fangs Forward Monthly
 * Meeting" in November and December.
 */

const MONTHS =
  "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec";
const ORDINAL_WORDS =
  "first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|annual";

const STRIP = [
  new RegExp(`\\b(${MONTHS})\\b`, "g"),
  new RegExp(`\\b(${ORDINAL_WORDS})\\b`, "g"),
  /\b(fall|spring|summer|winter)\b/g,
  /\b\d+(st|nd|rd|th)?\b/g,
  /[^a-z\s]/g,
];

export function normalizeSeriesTitle(title: string): string {
  let text = title.toLowerCase();
  for (const pattern of STRIP) text = text.replace(pattern, " ");
  return text.replace(/\s+/g, " ").trim();
}

export function seriesKey(title: string, hostIds: string[]): string {
  const hosts = hostIds.toSorted().join(",");
  return `${hosts}|${normalizeSeriesTitle(title)}`;
}
