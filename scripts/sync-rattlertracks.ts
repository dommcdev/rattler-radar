/**
 * Fetches upcoming events from RattlerTracks and saves them to a JSON file.
 *
 * Usage: bun run sync:rattlertracks
 *
 * The file is replaced in a single step (write to a temp file, then rename),
 * so a failed sync never leaves partial data behind; the previous file stays as-is.
 */
import { mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchUpcomingEvents } from "@/lib/rattlertracks";

const OUTPUT_PATH = path.join(
  process.cwd(),
  "data",
  "rattlertracks-events.json",
);

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

  await writeJsonAtomically(OUTPUT_PATH, {
    syncedAt: syncedAt.toISOString(),
    events,
  });

  console.log(
    `Saved ${events.length} events to ${path.relative(process.cwd(), OUTPUT_PATH)}`,
  );
}

async function writeJsonAtomically(filePath: string, data: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tempPath, filePath);
}

main().catch((error) => {
  console.error(
    "RattlerTracks sync failed; existing data left unchanged.",
    error,
  );
  process.exitCode = 1;
});
