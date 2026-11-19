/**
 * Tags stored events with Jev without fetching from RattlerTracks: every
 * event (real and demo, past and upcoming) whose text changed or that was
 * tagged by an older TAGGER_VERSION. Run it after changing the tag list.
 *
 * Usage:
 *   bun run tag:events              tag events that need it
 *   bun run tag:events --all        tag every event again
 *   bun run tag:events --limit 30   only the first 30 (soonest) that need it
 *
 * Prints what each event got, so you can spot-check the results.
 */
import { retagStoredEvents } from "@/lib/event-store";

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.indexOf("--limit");
  const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : undefined;

  const { tagged, total } = await retagStoredEvents({
    force: args.includes("--all"),
    limit,
    onProgress: (done, count) => {
      if (done % 25 === 0 || done === count) {
        console.log(`Tagged ${done}/${count}`);
      }
    },
  });

  for (const { title, tagging } of tagged) {
    const tags = tagging.tags
      .map((tag) => `${tag.tagId} ${tag.confidence.toFixed(2)}`)
      .join(", ");
    const perks = tagging.detectedBenefits.join(", ");
    console.log(
      `${title}\n  [${tagging.audience}] ${tags || "(no tags)"}${perks ? `  +${perks}` : ""}`,
    );
  }
  console.log(
    `Tagged ${tagged.length} of ${total} events. The site shows the new tags within the hour (or restart the dev server).`,
  );
}

main().catch((error) => {
  console.error("Tagging failed; existing tags left unchanged.", error);
  process.exitCode = 1;
});
