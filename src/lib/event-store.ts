/**
 * Where synced events are kept until the app has a database: a single JSON
 * file written by the sync script and read by the website.
 *
 * Both sides go through this module, so the file's location and format are
 * defined in one place. Swapping in a database later means reimplementing
 * `saveEvents` and `loadEvents`, not touching their callers.
 */
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  type RattlerTracksEvent,
  rattlerTracksEventSchema,
} from "@/lib/rattlertracks";

const STORE_PATH = path.join(
  process.cwd(),
  "data",
  "rattlertracks-events.json",
);

const storedEventsSchema = z.object({
  syncedAt: z.iso.datetime(),
  events: z.array(rattlerTracksEventSchema),
});

export type StoredEvents = z.infer<typeof storedEventsSchema>;

/**
 * Replaces the stored events. The file is written to a temp file and then
 * renamed, so readers never see a half-written file and a failed write
 * leaves the previous data in place.
 */
export async function saveEvents(
  events: RattlerTracksEvent[],
  syncedAt: Date,
): Promise<string> {
  const data: StoredEvents = { syncedAt: syncedAt.toISOString(), events };
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  const tempPath = `${STORE_PATH}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tempPath, STORE_PATH);
  return STORE_PATH;
}

/**
 * Reads the stored events. Returns `null` if no sync has run yet; throws if
 * the file exists but doesn't match the expected format.
 */
export async function loadEvents(): Promise<StoredEvents | null> {
  let contents: string;
  try {
    contents = await readFile(STORE_PATH, "utf8");
  } catch (error) {
    if (isFileNotFound(error)) return null;
    throw error;
  }
  return storedEventsSchema.parse(JSON.parse(contents));
}

function isFileNotFound(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
