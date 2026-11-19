import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { loadUpcomingEvents, type StoredEvent } from "@/lib/event-store";
import type { EventDetails, EventFeedData, FeedEvent } from "./feed-event";
import { formatDateParts, formatDateTime, formatWhen } from "./format";
import type { EventTag } from "./tag-event";
import { type Audience, FREE_FOOD, SHOWN_TAG_MIN_CONFIDENCE } from "./tagging";

/** Formatting RattlerTracks descriptions use; anything else is stripped. */
const DESCRIPTION_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["http", "https", "mailto"],
  // Organizers space paragraphs with empty ones (<p>&nbsp;</p>); drop them.
  exclusiveFilter: (frame) =>
    frame.tag === "p" && frame.text.replace(/&nbsp;| /g, "").trim() === "",
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
};

/** The daily sync clears this tag so new events show up right away. */
export const EVENTS_CACHE_TAG = "events";

/**
 * Upcoming events straight from the database, with their tags.
 *
 * Cached for an hour: events only change when the daily sync runs (which
 * clears the cache), and the hourly refresh decides when finished events
 * drop off the page.
 */
async function getUpcomingEvents() {
  "use cache";
  cacheLife("hours");
  cacheTag(EVENTS_CACHE_TAG);
  return loadUpcomingEvents(new Date());
}

/** Upcoming events for the home page, soonest first. */
export async function getEventFeed(): Promise<EventFeedData> {
  const { events, syncedAt } = await getUpcomingEvents();
  return {
    events: events.map(toFeedEvent),
    lastSynced: syncedAt ? formatDateTime(syncedAt.toISOString()) : null,
  };
}

/** One upcoming event, for its page. Null if it doesn't exist or has ended. */
export async function getEvent(id: string): Promise<EventDetails | null> {
  const { events } = await getUpcomingEvents();
  const event = events.find((upcoming) => upcoming.id === id);
  if (!event) return null;
  return {
    ...toFeedEvent(event),
    descriptionHtml: event.descriptionHtml
      ? sanitizeHtml(event.descriptionHtml, DESCRIPTION_HTML_OPTIONS)
      : null,
  };
}

/** What scoring needs to know about each upcoming event. Server-only. */
export interface EventSignals {
  id: string;
  startsAt: number;
  seriesKey: string;
  hostIds: string[];
  tags: EventTag[];
  audience: Audience | null;
}

export async function getUpcomingEventSignals(): Promise<EventSignals[]> {
  const { events } = await getUpcomingEvents();
  return events.map((event) => ({
    id: event.id,
    startsAt: event.startsAt.getTime(),
    seriesKey: event.seriesKey,
    hostIds: event.hosts.map((host) => host.id),
    tags: event.tags,
    audience: event.audience,
  }));
}

function toFeedEvent(event: StoredEvent): FeedEvent {
  // The organizer's perks first, then any Jev found that they didn't list.
  const benefits = [...new Set([...event.benefits, ...event.detectedBenefits])];
  const startsAt = event.startsAt.toISOString();
  const endsAt = event.endsAt?.toISOString() ?? null;
  return {
    id: event.id,
    source: event.source,
    url: event.url,
    title: event.title,
    startsAt,
    endsAt,
    when: formatWhen(startsAt, endsAt),
    start: formatDateParts(startsAt),
    location: event.location,
    hosts: event.hosts,
    imageUrl: event.imageUrl,
    tags: event.tags
      .filter((tag) => tag.confidence >= SHOWN_TAG_MIN_CONFIDENCE)
      .map((tag) => tag.tagId),
    audience: event.audience,
    hasFreeFood: benefits.includes(FREE_FOOD),
    benefits,
    rsvpCount: event.rsvpCount,
  };
}
