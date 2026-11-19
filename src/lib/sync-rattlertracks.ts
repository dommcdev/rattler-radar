import { saveRattlerTracksEvents } from "@/lib/event-store";
import { fetchUpcomingEvents } from "@/lib/rattlertracks";

export interface SyncResult {
  saved: number;
  removed: number;
  /** Events RattlerTracks returned that failed validation. */
  skipped: { id: string | null; reason: string }[];
}

/**
 * Fetches upcoming events from RattlerTracks, tags them, and saves them.
 * Used by the daily cron (`src/app/api/cron/sync/route.ts`) and by
 * `bun run sync:rattlertracks`. If it throws, the stored events are left
 * unchanged.
 */
export async function syncRattlerTracks(): Promise<SyncResult> {
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
  const { saved, removed } = await saveRattlerTracksEvents(events, syncedAt);
  return { saved, removed, skipped };
}
