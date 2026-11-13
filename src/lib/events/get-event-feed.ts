import "server-only";

import { cacheLife } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { loadEvents } from "@/lib/event-store";
import type { RattlerTracksEvent } from "@/lib/rattlertracks";
import type { EventFeedData, FeedEvent } from "./feed-event";
import { formatDateParts, formatDateTime, formatSchedule } from "./format";

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

function toFeedEvent(event: RattlerTracksEvent): FeedEvent {
  return {
    id: event.sourceId,
    url: event.url,
    title: event.title,
    startsAt: event.startsAt,
    schedule: formatSchedule(event.startsAt, event.endsAt),
    start: formatDateParts(event.startsAt),
    location: event.location,
    hosts: event.hosts.map((host) => host.name),
    imageUrl: event.imageUrl,
    topic: event.theme ? (TOPIC_LABELS[event.theme] ?? event.theme) : null,
    categories: event.categories,
    hasFreeFood: event.benefits.includes(FREE_FOOD),
    rsvpCount: event.rsvpCount,
    descriptionHtml: event.descriptionHtml
      ? sanitizeHtml(event.descriptionHtml, DESCRIPTION_HTML_OPTIONS)
      : null,
  };
}
