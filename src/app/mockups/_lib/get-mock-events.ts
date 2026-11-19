import "server-only";

import type { EventDetails } from "@/lib/events/feed-event";
import { getEvent, getEventFeed } from "@/lib/events/get-event-feed";
import { EVENT_INTERESTS } from "./data";

export interface MockEvent extends EventDetails {
  /** Mock interest tag IDs (see `INTEREST_GROUPS`). */
  interests: string[];
}

/** The real synced events, each with made-up interest tags. */
export async function getMockEvents(): Promise<{
  events: MockEvent[];
  lastSynced: string | null;
}> {
  const { events, lastSynced } = await getEventFeed();
  return {
    events: await Promise.all(
      events.map(async (event) => ({
        ...event,
        descriptionHtml: (await getEvent(event.id))?.descriptionHtml ?? null,
        interests: EVENT_INTERESTS[event.id] ?? [],
      })),
    ),
    lastSynced,
  };
}
