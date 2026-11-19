import { saveRattlerTracksEvents, type TagProgress } from "@/lib/event-store";
import { fetchUpcomingEvents } from "@/lib/rattlertracks";

export interface SyncResult {
  saved: number;
  removed: number;
  /** New or changed events tagged with Jev; the rest kept their tags. */
  tagged: number;
  /** Events RattlerTracks returned that failed validation. */
  skipped: { id: string | null; reason: string }[];
}

/**
 * Fetches upcoming events from RattlerTracks, tags them, and saves them.
 * Used by the daily cron (`src/app/api/cron/sync/route.ts`) and by
 * `bun run sync:rattlertracks`. If it throws, the stored events are left
 * unchanged.
 */
export async function syncRattlerTracks(
  options: TagProgress = {},
): Promise<SyncResult> {
  const syncedAt = new Date();
  const { events, skipped } = await fetchUpcomingEvents({
    endsAfter: syncedAt,
    onRetry: (error, attempt, delayMs) => {
      console.warn(
        `RattlerTracks attempt ${attempt} failed, retrying in ${delayMs}ms:`,
        error,
      );
    },
  });
  const { saved, removed, tagged } = await saveRattlerTracksEvents(
    events,
    syncedAt,
    options,
  );
  return { saved, removed, tagged, skipped };
}
