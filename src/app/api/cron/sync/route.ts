import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { EVENTS_CACHE_TAG } from "@/lib/events/get-event-feed";
import { syncRattlerTracks } from "@/lib/sync-rattlertracks";

/**
 * Fetching, tagging, and saving takes a few seconds (only new or changed
 * events are sent to Jev); leave room for retries and a big first sync.
 */
export const maxDuration = 300;

/**
 * The daily RattlerTracks sync, called by Vercel Cron (see `vercel.json`).
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is
 * turned away, so visitors can't trigger syncs.
 */
export async function GET(request: Request) {
  if (
    !env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncRattlerTracks();
    // Show the new events now instead of when the hour-long cache expires.
    revalidateTag(EVENTS_CACHE_TAG, "max");
    for (const event of result.skipped) {
      console.warn(
        `Skipped invalid event ${event.id ?? "(no id)"}: ${event.reason}`,
      );
    }
    console.log(
      `RattlerTracks sync: saved ${result.saved}, tagged ${result.tagged}, removed ${result.removed}, skipped ${result.skipped.length}.`,
    );
    return Response.json(result);
  } catch (error) {
    console.error(
      "RattlerTracks sync failed; existing data left unchanged.",
      error,
    );
    return Response.json({ error: "Sync failed" }, { status: 500 });
  }
}
