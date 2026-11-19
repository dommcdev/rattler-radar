/**
 * Fills the database with demo events: the past year of RattlerTracks events,
 * moved one year ahead so they show as upcoming. They're saved with source
 * "demo" and IDs starting with "demo-", so the daily sync never touches them.
 *
 * Usage:
 *   bun run seed:demo            replace the demo events (a few API requests)
 *   bun run seed:demo --remove   delete all demo events
 */
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { event } from "@/db/schema";
import { runBatch, taggingStatements, toEventRow } from "@/lib/event-store";
import { tagEvents, taggingHash } from "@/lib/events/tag-event";
import {
  fetchUpcomingEvents,
  type RattlerTracksEvent,
} from "@/lib/rattlertracks";

async function main() {
  // Interactions and tags go with the events (ON DELETE CASCADE).
  const removeDemoEvents = db.delete(event).where(eq(event.source, "demo"));
  if (process.argv.includes("--remove")) {
    await removeDemoEvents;
    console.log("Removed all demo events.");
    return;
  }

  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setUTCFullYear(now.getUTCFullYear() - 1);

  // Everything that ended in the past year. Events still upcoming are real
  // and come from the normal sync instead.
  const { events } = await fetchUpcomingEvents({ endsAfter: yearAgo });
  const past = events.filter(
    (e) => Date.parse(e.endsAt ?? e.startsAt) <= now.getTime(),
  );

  const shifted = past.map(nextYear);
  const taggings = await tagEvents(shifted, {
    onProgress: (done, total) => console.log(`Tagged ${done}/${total}`),
  });
  // Tagged before anything is deleted, so a failure leaves the old demo events.
  const statements = shifted.flatMap((e, i) => {
    const id = `demo-${e.sourceId}`;
    return [
      db.insert(event).values(toEventRow(e, { id, source: "demo" })),
      ...taggingStatements(id, taggings[i], taggingHash(e)),
    ];
  });
  if (statements.length === 0) {
    console.log("RattlerTracks returned no past events; nothing to add.");
    return;
  }
  await runBatch([removeDemoEvents, ...statements]);

  console.log(
    `Added ${shifted.length} demo events (${shifted[0].startsAt.slice(0, 10)} to ${shifted.at(-1)?.startsAt.slice(0, 10)}).`,
  );
  console.log(
    "The site shows them within the hour (or restart the dev server).",
  );
}

/** The same event a year later; years in the title move too ("Fall 2025" → "Fall 2026"). */
function nextYear(e: RattlerTracksEvent): RattlerTracksEvent {
  const shift = (iso: string) => {
    const date = new Date(iso);
    date.setUTCFullYear(date.getUTCFullYear() + 1);
    return date.toISOString();
  };
  return {
    ...e,
    title: e.title.replace(/\b20\d\d\b/g, (year) => String(Number(year) + 1)),
    startsAt: shift(e.startsAt),
    endsAt: e.endsAt ? shift(e.endsAt) : null,
  };
}

main().catch((error) => {
  console.error("Seeding demo events failed:", error);
  process.exitCode = 1;
});
