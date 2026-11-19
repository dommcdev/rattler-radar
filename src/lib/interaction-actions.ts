"use server";

import { INTERACTION_TYPES, type InteractionType } from "@/db/schema";
import { recordInteraction } from "@/lib/event-interactions";
import { getEvent } from "@/lib/events/get-event-feed";
import { getSession } from "@/lib/session";

/**
 * Records that the signed-in student viewed an event or clicked to RSVP.
 * Does nothing for visitors who aren't signed in or for unknown events.
 */
export async function recordEventInteraction(
  eventId: string,
  type: InteractionType,
): Promise<void> {
  if (!INTERACTION_TYPES.includes(type)) return;
  const session = await getSession();
  if (!session) return;
  if (!(await getEvent(eventId))) return;
  await recordInteraction(session.user.id, eventId, type);
}
