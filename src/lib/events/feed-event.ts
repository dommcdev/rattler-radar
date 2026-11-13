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
  /** ISO 8601 timestamp, or null if RattlerTracks has no end time. */
  endsAt: string | null;
  /**
   * Formatted in campus time, e.g. { date: "Thursday, November 12",
   * time: "5:00 – 6:00 PM" }. For events that span days, the time includes
   * the end date: "9:00 PM – Sat, Nov 14, 1:00 AM".
   */
  when: { date: string; time: string };
  /** The start, split up for the card's date stamp, e.g. "Nov", "12", "5:00 PM". */
  start: { month: string; day: string; time: string };
  location: string | null;
  /** Organizations running the event. `id` is their RattlerTracks ID. */
  hosts: { id: string; name: string }[];
  imageUrl: string | null;
  /** Broad category used for filtering, e.g. "Social" or "Sports". */
  topic: string | null;
  /** RattlerTracks' finer-grained categories, e.g. "Meeting". */
  categories: string[];
  hasFreeFood: boolean;
  /** Perks RattlerTracks lists for the event, e.g. "Free Food", "Free Stuff". */
  benefits: string[];
  rsvpCount: number | null;
  /** Sanitized HTML, safe to render. */
  descriptionHtml: string | null;
}

export interface EventFeedData {
  events: FeedEvent[];
  /** When events were last synced from RattlerTracks, formatted in campus time. */
  lastSynced: string | null;
}
