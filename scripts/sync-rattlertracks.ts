/**
 * Runs the RattlerTracks sync by hand (it also runs daily on Vercel; see
 * `src/app/api/cron/sync/route.ts`).
 *
 * Usage: bun run sync:rattlertracks
 *
 * The site picks up the new events within an hour (the feed's cache), or
 * right away when the sync runs through the cron route instead.
 */
import { syncRattlerTracks } from "@/lib/sync-rattlertracks";

async function main() {
  const { saved, removed, skipped } = await syncRattlerTracks();
  for (const event of skipped) {
    console.warn(
      `Skipped invalid event ${event.id ?? "(no id)"}: ${event.reason}`,
    );
  }
  console.log(
    `Saved ${saved} events; removed ${removed} that are no longer listed.`,
  );
}

main().catch((error) => {
  console.error(
    "RattlerTracks sync failed; existing data left unchanged.",
    error,
  );
  process.exitCode = 1;
});
