import { describe, expect, test } from "bun:test";
import { fetchUpcomingEvents, RattlerTracksError } from "./client";

const ENDS_AFTER = new Date("2026-11-12T00:00:00Z");

function rawEvent(id: string) {
  return { id, name: `Event ${id}`, startsOn: "2026-11-13T20:00:00+00:00" };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

/** A fake `fetch` that returns the given responses in order and records each request URL. */
function fakeFetch(...responses: (Response | Error)[]) {
  const requests: URL[] = [];
  const fetch = (async (input: string | URL | Request) => {
    requests.push(new URL(input instanceof Request ? input.url : input));
    const next = responses.shift();
    if (!next) throw new Error("Unexpected extra request");
    if (next instanceof Error) throw next;
    return next;
  }) as typeof globalThis.fetch;
  return { fetch, requests };
}

function fetchWith(fetch: typeof globalThis.fetch) {
  const delays: number[] = [];
  const result = fetchUpcomingEvents({
    endsAfter: ENDS_AFTER,
    fetch,
    sleep: async (ms) => {
      delays.push(ms);
    },
  });
  return { result, delays };
}

describe("fetchUpcomingEvents", () => {
  test("follows pagination until every event is fetched", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => rawEvent(String(i)));
    const page2 = [rawEvent("100"), rawEvent("101")];
    const { fetch, requests } = fakeFetch(
      jsonResponse({ "@odata.count": 102, value: page1 }),
      jsonResponse({ "@odata.count": 102, value: page2 }),
    );

    const { events, skipped } = await fetchWith(fetch).result;

    expect(events).toHaveLength(102);
    expect(skipped).toEqual([]);
    expect(requests.map((url) => url.searchParams.get("skip"))).toEqual([
      "0",
      "100",
    ]);
    expect(requests[0].searchParams.get("endsAfter")).toBe(
      ENDS_AFTER.toISOString(),
    );
  });

  test("does not duplicate an event that appears on two pages", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => rawEvent(String(i)));
    const { fetch } = fakeFetch(
      jsonResponse({ "@odata.count": 101, value: page1 }),
      jsonResponse({ "@odata.count": 101, value: [rawEvent("99")] }),
    );

    const { events } = await fetchWith(fetch).result;

    expect(events).toHaveLength(100);
  });

  test("skips invalid events but keeps the rest", async () => {
    const { fetch } = fakeFetch(
      jsonResponse({
        "@odata.count": 2,
        value: [rawEvent("1"), { id: "2", name: "No start" }],
      }),
    );

    const { events, skipped } = await fetchWith(fetch).result;

    expect(events.map((e) => e.sourceId)).toEqual(["1"]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].id).toBe("2");
  });

  test("retries temporary failures with exponential backoff", async () => {
    const { fetch, requests } = fakeFetch(
      new TypeError("fetch failed"),
      jsonResponse({}, 503),
      jsonResponse({ "@odata.count": 1, value: [rawEvent("1")] }),
    );

    const { result, delays } = fetchWith(fetch);
    const { events } = await result;

    expect(events).toHaveLength(1);
    expect(requests).toHaveLength(3);
    expect(delays).toEqual([1000, 2000]);
  });

  test("gives up after 3 attempts", async () => {
    const { fetch, requests } = fakeFetch(
      jsonResponse({}, 503),
      jsonResponse({}, 503),
      jsonResponse({}, 503),
    );

    await expect(fetchWith(fetch).result).rejects.toThrow("HTTP 503");
    expect(requests).toHaveLength(3);
  });

  test("does not retry errors that won't resolve themselves", async () => {
    const { fetch, requests } = fakeFetch(jsonResponse({}, 404));

    await expect(fetchWith(fetch).result).rejects.toBeInstanceOf(
      RattlerTracksError,
    );
    expect(requests).toHaveLength(1);
  });

  test("fails without retrying when the response format changes", async () => {
    const { fetch, requests } = fakeFetch(jsonResponse({ results: [] }));

    await expect(fetchWith(fetch).result).rejects.toThrow(
      "Unexpected response format",
    );
    expect(requests).toHaveLength(1);
  });
});
