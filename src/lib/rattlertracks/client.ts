import { setTimeout as sleep } from "node:timers/promises";
import { normalizeEvent, type RattlerTracksEvent } from "./normalize";
import { withRetry } from "./retry";
import {
  rawEventSchema,
  type SearchResponse,
  searchResponseSchema,
} from "./schema";

/**
 * The JSON API the RattlerTracks website itself uses. It's undocumented and
 * robots.txt asks crawlers not to use it, so we keep traffic minimal: few
 * requests, an honest User-Agent, and a pause between pages.
 */
export const SEARCH_URL =
  "https://stmarytx.campuslabs.com/engage/api/discovery/event/search";

const USER_AGENT =
  "RattlerRadar/0.1 (student project; daily campus event sync)";
const PAGE_SIZE = 100;
const PAGE_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 1_000;

export class RattlerTracksError extends Error {
  constructor(
    message: string,
    /** Whether trying again later might succeed (network issues, 5xx, 429). */
    readonly retryable: boolean,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "RattlerTracksError";
  }
}

export interface SkippedEvent {
  /** The event's id, if it had one. */
  id: string | null;
  reason: string;
}

export interface FetchEventsResult {
  events: RattlerTracksEvent[];
  /** Events that failed validation (e.g. missing a title or start time). */
  skipped: SkippedEvent[];
}

export interface FetchEventsOptions {
  /** Only fetch events ending after this time. Defaults to now. */
  endsAfter?: Date;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  /** Injectable for tests. */
  fetch?: typeof fetch;
  /** Injectable for tests. */
  sleep?: (ms: number) => Promise<void>;
}

/** Fetches every upcoming public event from RattlerTracks, following pagination. */
export async function fetchUpcomingEvents(
  options: FetchEventsOptions = {},
): Promise<FetchEventsResult> {
  const endsAfter = options.endsAfter ?? new Date();
  const fetchFn = options.fetch ?? fetch;
  const sleepFn = options.sleep ?? sleep;

  // Keyed by id: if an event is added upstream mid-sync, pages can shift
  // and the same event can show up on two pages.
  const events = new Map<string, RattlerTracksEvent>();
  const skipped: SkippedEvent[] = [];

  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    if (offset > 0) await sleepFn(PAGE_DELAY_MS);

    const page = await withRetry(
      () => fetchPage(fetchFn, { endsAfter, offset }),
      {
        maxAttempts: MAX_ATTEMPTS,
        baseDelayMs: BASE_RETRY_DELAY_MS,
        shouldRetry: (error) =>
          error instanceof RattlerTracksError && error.retryable,
        sleep: sleepFn,
        onRetry: options.onRetry,
      },
    );

    total = page["@odata.count"];
    // Guards against looping forever if the count is wrong.
    if (page.value.length === 0) break;

    for (const item of page.value) {
      const parsed = rawEventSchema.safeParse(item);
      if (parsed.success) {
        events.set(parsed.data.id, normalizeEvent(parsed.data));
      } else {
        skipped.push({ id: readId(item), reason: parsed.error.message });
      }
    }

    offset += page.value.length;
  }

  return { events: [...events.values()], skipped };
}

async function fetchPage(
  fetchFn: typeof fetch,
  { endsAfter, offset }: { endsAfter: Date; offset: number },
): Promise<SearchResponse> {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({
    endsAfter: endsAfter.toISOString(),
    status: "Approved",
    orderByField: "endsOn",
    orderByDirection: "ascending",
    take: String(PAGE_SIZE),
    skip: String(offset),
  }).toString();

  let response: Response;
  try {
    response = await fetchFn(url, {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    // Network failures and timeouts are usually temporary.
    throw new RattlerTracksError(`Request to ${url} failed`, true, {
      cause: error,
    });
  }

  if (!response.ok) {
    const retryable = response.status === 429 || response.status >= 500;
    throw new RattlerTracksError(
      `RattlerTracks responded with HTTP ${response.status}`,
      retryable,
    );
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (error) {
    throw new RattlerTracksError("Response was not valid JSON", false, {
      cause: error,
    });
  }

  const parsed = searchResponseSchema.safeParse(body);
  if (!parsed.success) {
    // The API changed shape; retrying won't help.
    throw new RattlerTracksError(
      `Unexpected response format: ${parsed.error.message}`,
      false,
    );
  }
  return parsed.data;
}

function readId(item: unknown): string | null {
  if (typeof item === "object" && item !== null && "id" in item) {
    return String(item.id);
  }
  return null;
}
