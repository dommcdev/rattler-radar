import { describe, expect, test } from "bun:test";
import { normalizeSeriesTitle, seriesKey } from "./series";

describe("normalizeSeriesTitle", () => {
  test("drops ordinals, numbers, months, and punctuation", () => {
    expect(normalizeSeriesTitle("HRBLS 3rd General Meeting")).toBe(
      "hrbls general meeting",
    );
    expect(normalizeSeriesTitle("Alpha Phifa 2026")).toBe("alpha phifa");
    expect(normalizeSeriesTitle("November Mixer: Fall '26!")).toBe("mixer");
  });
});

describe("seriesKey", () => {
  test("matches repeats from the same hosts", () => {
    expect(seriesKey("HRBLS 3rd General Meeting", ["1"])).toBe(
      seriesKey("HRBLS 4th General Meeting", ["1"]),
    );
  });

  test("ignores host order", () => {
    expect(seriesKey("Trivia", ["2", "1"])).toBe(
      seriesKey("Trivia", ["1", "2"]),
    );
  });

  test("keeps different hosts apart", () => {
    expect(seriesKey("General Meeting", ["1"])).not.toBe(
      seriesKey("General Meeting", ["2"]),
    );
  });
});
