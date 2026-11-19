import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/**
 * Where an event came from. "demo": last year's RattlerTracks events moved a
 * year ahead, for demos (`bun run seed:demo`); the sync leaves them alone.
 */
export const EVENT_SOURCES = [
  "rattlertracks",
  "club",
  "student",
  "demo",
] as const;
export type EventSource = (typeof EVENT_SOURCES)[number];

/**
 * Every event the app knows about, past and upcoming. Past events are kept
 * so a student's history (which series and clubs they go to) still means
 * something after the events end.
 */
export const event = sqliteTable(
  "event",
  {
    /** For RattlerTracks events, their RattlerTracks ID (used in URLs). */
    id: text("id").primaryKey(),
    source: text("source", { enum: EVENT_SOURCES }).notNull(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    /** Raw HTML. Must be sanitized before rendering. */
    descriptionHtml: text("description_html"),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    location: text("location"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    imageUrl: text("image_url"),
    hosts: text("hosts", { mode: "json" })
      .$type<{ id: string; name: string }[]>()
      .notNull(),
    theme: text("theme"),
    categories: text("categories", { mode: "json" })
      .$type<string[]>()
      .notNull(),
    benefits: text("benefits", { mode: "json" }).$type<string[]>().notNull(),
    rsvpCount: integer("rsvp_count"),
    /** Events that repeat (same hosts, same title apart from numbers and dates) share a key. See `series.ts`. */
    seriesKey: text("series_key").notNull(),
  },
  (table) => [
    index("event_starts_at_idx").on(table.startsAt),
    index("event_series_key_idx").on(table.seriesKey),
  ],
);

/** When each source last synced, for the "updated" note on the feed. */
export const eventSync = sqliteTable("event_sync", {
  source: text("source", { enum: EVENT_SOURCES }).primaryKey(),
  syncedAt: integer("synced_at", { mode: "timestamp_ms" }).notNull(),
});

/**
 * What an event is about, as interest IDs from `src/lib/interests.ts`, with
 * how sure the tagger is (0 to 1). Written by `tagEvent` at sync time.
 */
export const eventTag = sqliteTable(
  "event_tag",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    tagId: text("tag_id").notNull(),
    confidence: real("confidence").notNull(),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.tagId] })],
);

/**
 * Things students do with events, used to work out what they'd like.
 * "view": opened the event's page. "rsvp_click": clicked through to RSVP
 * on RattlerTracks (our stand-in for attending until we can tell).
 */
export const INTERACTION_TYPES = ["view", "rsvp_click"] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const eventInteraction = sqliteTable(
  "event_interaction",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    type: text("type", { enum: INTERACTION_TYPES }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [index("event_interaction_user_idx").on(table.userId)],
);
