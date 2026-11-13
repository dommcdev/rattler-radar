/**
 * The shape of an event as the website displays it. Built on the server from
 * stored RattlerTracks events (see `get-event-feed.ts`) and passed to client
 * components, so it holds only what the UI needs, ready to display.
 */
export interface FeedEvent {
  id: string;
  /** The event's page on RattlerTracks, where students RSVP. */
  url: string;
  title: string;
  /** ISO 8601 timestamp, for `<time dateTime>`. */
  startsAt: string;
  /** Formatted in campus time, e.g. "Thu, Nov 12, 5:00 – 6:00 PM". */
  schedule: string;
  /** The start, split up for the card's date stamp, e.g. "Nov", "12", "5:00 PM". */
  start: { month: string; day: string; time: string };
  location: string | null;
  hosts: string[];
  imageUrl: string | null;
  /** Broad category used for filtering, e.g. "Social" or "Sports". */
  topic: string | null;
  /** RattlerTracks' finer-grained categories, e.g. "Meeting". */
  categories: string[];
  hasFreeFood: boolean;
  rsvpCount: number | null;
  /** Sanitized HTML, safe to render. */
  descriptionHtml: string | null;
}

export interface EventFeedData {
  events: FeedEvent[];
  /** When events were last synced from RattlerTracks, formatted in campus time. */
  lastSynced: string | null;
}
