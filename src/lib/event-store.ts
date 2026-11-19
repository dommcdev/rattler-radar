/**
 * Where synced events are kept: the `event`, `event_tag`, and `event_sync`
 * tables. The sync script writes through `saveRattlerTracksEvents`; the
 * website reads through `loadUpcomingEvents`.
 */
import {
  and,
  eq,
  getTableColumns,
  gt,
  inArray,
  notInArray,
  sql,
} from "drizzle-orm";
import { db } from "@/db/client";
import { type EventSource, event, eventSync, eventTag } from "@/db/schema";
import { seriesKey } from "@/lib/events/series";
import { type EventTag, tagEvent } from "@/lib/events/tag-event";
import type { RattlerTracksEvent } from "@/lib/rattlertracks";

export type StoredEvent = typeof event.$inferSelect & { tags: EventTag[] };

/** `ends_at`, or `starts_at` for events with no end time. */
const eventEnd = sql`coalesce(${event.endsAt}, ${event.startsAt})`;

/**
 * Saves a sync's events: new ones are added, existing ones updated, and
 * upcoming RattlerTracks events missing from the sync (cancelled or
 * unpublished) are removed. Past events are kept for students' history.
 * Each event is tagged again. Everything is written in one batch, so a
 * failed save leaves the previous data in place.
 */
export async function saveRattlerTracksEvents(
  events: RattlerTracksEvent[],
  syncedAt: Date,
): Promise<{ saved: number; removed: number }> {
  const tagged = await Promise.all(
    events.map(async (rtEvent) => ({ rtEvent, tags: await tagEvent(rtEvent) })),
  );
  const ids = events.map((rtEvent) => rtEvent.sourceId);

  const missing = await db
    .select({ id: event.id })
    .from(event)
    .where(
      and(
        eq(event.source, "rattlertracks"),
        gt(eventEnd, syncedAt.getTime()),
        notInArray(event.id, ids),
      ),
    );

  const statements = [
    ...tagged.map(({ rtEvent }) => {
      const row = toEventRow(rtEvent);
      return db
        .insert(event)
        .values(row)
        .onConflictDoUpdate({ target: event.id, set: row });
    }),
    ...(missing.length > 0
      ? [
          db.delete(event).where(
            inArray(
              event.id,
              missing.map(({ id }) => id),
            ),
          ),
        ]
      : []),
    ...(ids.length > 0
      ? [db.delete(eventTag).where(inArray(eventTag.eventId, ids))]
      : []),
    ...tagged.flatMap(({ rtEvent, tags }) =>
      tags.length > 0
        ? [
            db
              .insert(eventTag)
              .values(
                tags.map((tag) => ({ eventId: rtEvent.sourceId, ...tag })),
              ),
          ]
        : [],
    ),
    db
      .insert(eventSync)
      .values({ source: "rattlertracks", syncedAt })
      .onConflictDoUpdate({ target: eventSync.source, set: { syncedAt } }),
  ];
  const [first, ...rest] = statements;
  await db.batch([first, ...rest]);

  return { saved: events.length, removed: missing.length };
}

/** Events that haven't ended by `now`, soonest first, with their tags. */
export async function loadUpcomingEvents(now: Date): Promise<{
  syncedAt: Date | null;
  events: StoredEvent[];
}> {
  const [rows, tagRows, sync] = await Promise.all([
    db
      .select()
      .from(event)
      .where(gt(eventEnd, now.getTime()))
      .orderBy(event.startsAt),
    db
      .select(getTableColumns(eventTag))
      .from(eventTag)
      .innerJoin(event, eq(event.id, eventTag.eventId))
      .where(gt(eventEnd, now.getTime())),
    db.select().from(eventSync).where(eq(eventSync.source, "rattlertracks")),
  ]);

  const tagsByEvent = Map.groupBy(tagRows, (tag) => tag.eventId);
  return {
    syncedAt: sync[0]?.syncedAt ?? null,
    events: rows.map((row) => ({
      ...row,
      tags: (tagsByEvent.get(row.id) ?? []).map(({ tagId, confidence }) => ({
        tagId,
        confidence,
      })),
    })),
  };
}

/** A RattlerTracks event as a row of the `event` table. */
export function toEventRow(
  rtEvent: RattlerTracksEvent,
  { id = rtEvent.sourceId, source = "rattlertracks" as EventSource } = {},
): typeof event.$inferInsert {
  return {
    id,
    source,
    url: rtEvent.url,
    title: rtEvent.title,
    descriptionHtml: rtEvent.descriptionHtml,
    startsAt: new Date(rtEvent.startsAt),
    endsAt: rtEvent.endsAt ? new Date(rtEvent.endsAt) : null,
    location: rtEvent.location,
    latitude: rtEvent.latitude,
    longitude: rtEvent.longitude,
    imageUrl: rtEvent.imageUrl,
    hosts: rtEvent.hosts,
    theme: rtEvent.theme,
    categories: rtEvent.categories,
    benefits: rtEvent.benefits,
    rsvpCount: rtEvent.rsvpCount,
    seriesKey: seriesKey(
      rtEvent.title,
      rtEvent.hosts.map((host) => host.id),
    ),
  };
}
