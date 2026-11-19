import type { EventSource } from "@/db/schema";
import type { Audience } from "./tagging";

/**
 * The shape of an event as the website displays it. Built on the server from
 * stored RattlerTracks events (see `get-event-feed.ts`) and passed to client
 * components, so it holds only what the UI needs, ready to display.
 */
export interface FeedEvent {
  id: string;
  /** Where the event came from. Only "rattlertracks" so far. */
  source: EventSource;
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
  /**
   * Tag IDs from `src/lib/interests.ts` that Jev is fairly sure of, most
   * certain first. Used for the filter pills, search, and the tag pills.
   */
  tags: string[];
  /** Who it's for. Null if the event hasn't been tagged yet. */
  audience: Audience | null;
  hasFreeFood: boolean;
  /**
   * Perks, e.g. "Free Food", "Free Stuff": what the organizer listed on
   * RattlerTracks, plus any Jev found in the description.
   */
  benefits: string[];
  rsvpCount: number | null;
}

/** An event with everything its page shows. Lists leave the description out to stay small. */
export interface EventDetails extends FeedEvent {
  /** Sanitized HTML, safe to render. */
  descriptionHtml: string | null;
}

export interface EventFeedData {
  events: FeedEvent[];
  /** When events were last synced from RattlerTracks, formatted in campus time. */
  lastSynced: string | null;
}

/** Which time header an event sits under in "Upcoming events for you". */
export type TimeGroup = "soon" | "next-month" | "distant";

export type PersonalFeed =
  /** Nothing to go on yet: no interests and no history. */
  | { kind: "empty" }
  | {
      kind: "ready";
      /** "Events you might like", best first. */
      mightLike: { id: string }[];
      /** Every "for you" event, soonest first. */
      forYou: { id: string; group: TimeGroup }[];
    };
