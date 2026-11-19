import "server-only";

import { getInteractions } from "@/lib/event-interactions";
import { getUserInterests } from "@/lib/user-interests";
import type { PersonalFeed, TimeGroup } from "./feed-event";
import { getEventFeed, getUpcomingEventSignals } from "./get-event-feed";
import { pickSections, scoreEvents } from "./score";

const DAY_MS = 86_400_000;

/** The home page's two sections for one student. */
export async function getPersonalFeed(userId: string): Promise<PersonalFeed> {
  const [interests, interactions, signals, { events }] = await Promise.all([
    getUserInterests(userId),
    getInteractions(userId),
    getUpcomingEventSignals(),
    getEventFeed(),
  ]);
  if (interests.length === 0 && interactions.length === 0) {
    return { kind: "empty" };
  }

  const now = Date.now();
  const { mightLike, forYou } = pickSections(
    scoreEvents(signals, { interests, interactions }, now),
  );
  const eventsById = new Map(events.map((event) => [event.id, event]));

  return {
    kind: "ready",
    mightLike: mightLike
      .filter((score) => eventsById.has(score.eventId))
      .map((score) => ({ id: score.eventId })),
    forYou: forYou.flatMap((score) => {
      const event = eventsById.get(score.eventId);
      if (!event) return [];
      const days = (Date.parse(event.startsAt) - now) / DAY_MS;
      const group: TimeGroup =
        days < 30 ? "soon" : days < 60 ? "next-month" : "distant";
      return [{ id: event.id, group }];
    }),
  };
}
