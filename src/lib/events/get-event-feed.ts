import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { loadUpcomingEvents, type StoredEvent } from "@/lib/event-store";
import type { EventDetails, EventFeedData, FeedEvent } from "./feed-event";
import { formatDateParts, formatDateTime, formatWhen } from "./format";
import type { EventTag } from "./tag-event";

/** RattlerTracks' theme names, renamed to what students would call them. */
const TOPIC_LABELS: Record<string, string> = {
  Athletics: "Sports",
  Social: "Social",
  GroupBusiness: "Club meetings",
  Fundraising: "Fundraisers",
  ThoughtfulLearning: "Learning",
  CommunityService: "Service",
  Cultural: "Culture",
  Spirituality: "Faith",
};

const FREE_FOOD = "Free Food";

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
}

export async function getUpcomingEventSignals(): Promise<EventSignals[]> {
  const { events } = await getUpcomingEvents();
  return events.map((event) => ({
    id: event.id,
    startsAt: event.startsAt.getTime(),
    seriesKey: event.seriesKey,
    hostIds: event.hosts.map((host) => host.id),
    tags: event.tags,
  }));
}

function toFeedEvent(event: StoredEvent): FeedEvent {
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
    topic: event.theme ? (TOPIC_LABELS[event.theme] ?? event.theme) : null,
    categories: event.categories,
    hasFreeFood: event.benefits.includes(FREE_FOOD),
    benefits: event.benefits,
    rsvpCount: event.rsvpCount,
  };
}
