import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { event, eventInteraction, type InteractionType } from "@/db/schema";

/** One thing a student did with an event, with what scoring needs about the event. */
export interface PastInteraction {
  eventId: string;
  type: InteractionType;
  eventStartsAt: number;
  seriesKey: string;
  hostIds: string[];
}

export async function recordInteraction(
  userId: string,
  eventId: string,
  type: InteractionType,
): Promise<void> {
  await db.insert(eventInteraction).values({ userId, eventId, type });
}

/** Everything a student has done with events, past and upcoming. */
export async function getInteractions(
  userId: string,
): Promise<PastInteraction[]> {
  const rows = await db
    .select({
      eventId: eventInteraction.eventId,
      type: eventInteraction.type,
      startsAt: event.startsAt,
      seriesKey: event.seriesKey,
      hosts: event.hosts,
    })
    .from(eventInteraction)
    .innerJoin(event, eq(event.id, eventInteraction.eventId))
    .where(eq(eventInteraction.userId, userId));

  return rows.map((row) => ({
    eventId: row.eventId,
    type: row.type,
    eventStartsAt: row.startsAt.getTime(),
    seriesKey: row.seriesKey,
    hostIds: row.hosts.map((host) => host.id),
  }));
}
