import "server-only";

import { cacheLife } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { loadEvents } from "@/lib/event-store";
import type { RattlerTracksEvent } from "@/lib/rattlertracks";
import type { EventFeedData, FeedEvent } from "./feed-event";
import { formatDateParts, formatDateTime, formatWhen } from "./format";

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

/**
 * Upcoming events for the home page, soonest first.
 *
 * Cached for an hour: events only change when the daily sync runs, and the
 * cache also decides when finished events drop off the page.
 */
export async function getEventFeed(): Promise<EventFeedData> {
  "use cache";
  cacheLife("hours");

  const stored = await loadEvents();
  if (!stored) return { events: [], lastSynced: null };

  const now = Date.now();
  const events = stored.events
    .filter((event) => Date.parse(event.endsAt ?? event.startsAt) > now)
    .toSorted((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .map(toFeedEvent);

  return { events, lastSynced: formatDateTime(stored.syncedAt) };
}

/** One upcoming event, for its page. Null if it doesn't exist or has ended. */
export async function getEvent(id: string): Promise<FeedEvent | null> {
  const { events } = await getEventFeed();
  return events.find((event) => event.id === id) ?? null;
}

function toFeedEvent(event: RattlerTracksEvent): FeedEvent {
  return {
    id: event.sourceId,
    url: event.url,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    when: formatWhen(event.startsAt, event.endsAt),
    start: formatDateParts(event.startsAt),
    location: event.location,
    hosts: event.hosts,
    imageUrl: event.imageUrl,
    topic: event.theme ? (TOPIC_LABELS[event.theme] ?? event.theme) : null,
    categories: event.categories,
    hasFreeFood: event.benefits.includes(FREE_FOOD),
    benefits: event.benefits,
    rsvpCount: event.rsvpCount,
    descriptionHtml: event.descriptionHtml
      ? sanitizeHtml(event.descriptionHtml, DESCRIPTION_HTML_OPTIONS)
      : null,
  };
}
