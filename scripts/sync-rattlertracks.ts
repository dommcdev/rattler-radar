/**
 * Fetches upcoming events from RattlerTracks and saves them to the event store.
 *
 * Usage: bun run sync:rattlertracks
 *
 * If the sync fails, the previously stored events are left unchanged.
 */
import path from "node:path";
import { saveEvents } from "@/lib/event-store";
import { fetchUpcomingEvents } from "@/lib/rattlertracks";

async function main() {
  const syncedAt = new Date();

  const { events, skipped } = await fetchUpcomingEvents({
    endsAfter: syncedAt,
    onRetry: (error, attempt, delayMs) => {
      console.warn(
        `Attempt ${attempt} failed, retrying in ${delayMs}ms:`,
        error,
      );
    },
  });

  for (const event of skipped) {
    console.warn(
      `Skipped invalid event ${event.id ?? "(no id)"}: ${event.reason}`,
    );
  }

  const savedTo = await saveEvents(events, syncedAt);
  console.log(
    `Saved ${events.length} events to ${path.relative(process.cwd(), savedTo)}`,
  );
}

main().catch((error) => {
  console.error(
    "RattlerTracks sync failed; existing data left unchanged.",
    error,
  );
  process.exitCode = 1;
});
