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
import type { BatchItem } from "drizzle-orm/batch";
import { db } from "@/db/client";
import { type EventSource, event, eventSync, eventTag } from "@/db/schema";
import { seriesKey } from "@/lib/events/series";
import {
  type EventTag,
  type EventTagging,
  tagEvents,
  taggingHash,
} from "@/lib/events/tag-event";
import type { RattlerTracksEvent } from "@/lib/rattlertracks";

export type StoredEvent = typeof event.$inferSelect & { tags: EventTag[] };

type Statement = BatchItem<"sqlite">;

/** `ends_at`, or `starts_at` for events with no end time. */
const eventEnd = sql`coalesce(${event.endsAt}, ${event.startsAt})`;

export interface TagProgress {
  onProgress?: (done: number, total: number) => void;
}

/**
 * Saves a sync's events: new ones are added, existing ones updated, and
 * upcoming RattlerTracks events missing from the sync (cancelled or
 * unpublished) are removed. Past events are kept for students' history.
 *
 * New events, and ones whose text changed, are tagged with Jev first; the
 * rest keep their tags. Everything is written in one batch, so a failed
 * save (or failed tagging) leaves the previous data in place.
 */
export async function saveRattlerTracksEvents(
  events: RattlerTracksEvent[],
  syncedAt: Date,
  { onProgress }: TagProgress = {},
): Promise<{ saved: number; removed: number; tagged: number }> {
  const ids = events.map((rtEvent) => rtEvent.sourceId);

  const [missing, previous] = await Promise.all([
    db
      .select({ id: event.id })
      .from(event)
      .where(
        and(
          eq(event.source, "rattlertracks"),
          gt(eventEnd, syncedAt.getTime()),
          notInArray(event.id, ids),
        ),
      ),
    ids.length > 0
      ? db
          .select({ id: event.id, taggingHash: event.taggingHash })
          .from(event)
          .where(inArray(event.id, ids))
      : [],
  ]);

  const previousHashes = new Map(
    previous.map((row) => [row.id, row.taggingHash]),
  );
  const stale = events
    .map((rtEvent) => ({
      id: rtEvent.sourceId,
      event: rtEvent,
      hash: taggingHash(rtEvent),
    }))
    .filter(({ id, hash }) => previousHashes.get(id) !== hash);
  const taggings = await tagEvents(
    stale.map(({ event }) => event),
    { onProgress },
  );

  await runBatch([
    ...events.map((rtEvent) => {
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
    ...stale.flatMap(({ id, hash }, i) =>
      taggingStatements(id, taggings[i], hash),
    ),
    db
      .insert(eventSync)
      .values({ source: "rattlertracks", syncedAt })
      .onConflictDoUpdate({ target: eventSync.source, set: { syncedAt } }),
  ]);

  return {
    saved: events.length,
    removed: missing.length,
    tagged: stale.length,
  };
}

/**
 * Tags stored events (RattlerTracks and demo, past and upcoming) whose text
 * or tagger changed since they were last tagged, or every event with
 * `force`. For `bun run tag:events`.
 */
export async function retagStoredEvents({
  force = false,
  limit,
  onProgress,
}: TagProgress & { force?: boolean; limit?: number } = {}): Promise<{
  tagged: { id: string; title: string; tagging: EventTagging }[];
  total: number;
}> {
  const rows = await db
    .select({
      id: event.id,
      title: event.title,
      descriptionHtml: event.descriptionHtml,
      location: event.location,
      hosts: event.hosts,
      taggingHash: event.taggingHash,
    })
    .from(event)
    .orderBy(event.startsAt);

  const stale = rows
    .map((row) => ({ row, hash: taggingHash(row) }))
    .filter(({ row, hash }) => force || row.taggingHash !== hash)
    .slice(0, limit);
  const taggings = await tagEvents(
    stale.map(({ row }) => row),
    { onProgress },
  );

  await runBatch(
    stale.flatMap(({ row, hash }, i) =>
      taggingStatements(row.id, taggings[i], hash),
    ),
  );
  return {
    tagged: stale.map(({ row }, i) => ({
      id: row.id,
      title: row.title,
      tagging: taggings[i],
    })),
    total: rows.length,
  };
}

/** Replaces an event's tags, audience, and detected perks. */
export function taggingStatements(
  eventId: string,
  tagging: EventTagging,
  hash: string,
): Statement[] {
  return [
    db
      .update(event)
      .set({
        audience: tagging.audience,
        detectedBenefits: tagging.detectedBenefits,
        taggingHash: hash,
      })
      .where(eq(event.id, eventId)),
    db.delete(eventTag).where(eq(eventTag.eventId, eventId)),
    ...(tagging.tags.length > 0
      ? [
          db
            .insert(eventTag)
            .values(tagging.tags.map((tag) => ({ eventId, ...tag }))),
        ]
      : []),
  ];
}

/** Runs statements in one batch (all or nothing); does nothing if there are none. */
export async function runBatch(statements: Statement[]): Promise<void> {
  const [first, ...rest] = statements;
  if (first) await db.batch([first, ...rest]);
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
      tags: (tagsByEvent.get(row.id) ?? [])
        .map(({ tagId, confidence }) => ({ tagId, confidence }))
        .toSorted((a, b) => b.confidence - a.confidence),
    })),
  };
}

/**
 * A RattlerTracks event as a row of the `event` table. Leaves out what the
 * tagger writes (see `taggingStatements`), so updating a row keeps its tags.
 */
export function toEventRow(
  rtEvent: RattlerTracksEvent,
  { id = rtEvent.sourceId, source = "rattlertracks" as EventSource } = {},
) {
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
    benefits: rtEvent.benefits,
    rsvpCount: rtEvent.rsvpCount,
    seriesKey: seriesKey(
      rtEvent.title,
      rtEvent.hosts.map((host) => host.id),
    ),
  } satisfies typeof event.$inferInsert;
}
