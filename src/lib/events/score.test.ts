import { describe, expect, test } from "bun:test";
import {
  FOR_YOU_MIN_AFFINITY,
  type Interaction,
  MIGHT_LIKE_MIN_SCORE,
  pickSections,
  type ScorableEvent,
  scoreEvents,
} from "./score";

const NOW = Date.parse("2026-11-18T12:00:00Z");
const DAY = 86_400_000;

function upcoming(
  id: string,
  daysOut: number,
  extra: Partial<ScorableEvent> = {},
): ScorableEvent {
  return {
    id,
    startsAt: NOW + daysOut * DAY,
    seriesKey: `series-${id}`,
    hostIds: [`host-${id}`],
    tags: [],
    audience: "everyone",
    ...extra,
  };
}

function pastRsvp(
  eventId: string,
  seriesKey: string,
  hostId: string,
): Interaction {
  return {
    eventId,
    type: "rsvp_click",
    eventStartsAt: NOW - 30 * DAY,
    seriesKey,
    hostIds: [hostId],
  };
}

describe("scoreEvents", () => {
  test("a series attended 5 times makes the top section 3 months out", () => {
    const event = upcoming("meeting", 90, {
      seriesKey: "fangs|meeting",
      hostIds: ["fangs"],
    });
    const interactions = [1, 2, 3, 4, 5].map((n) =>
      pastRsvp(`old-${n}`, "fangs|meeting", "fangs"),
    );
    const [result] = scoreEvents([event], { interests: [], interactions }, NOW);
    expect(result.score).toBeGreaterThanOrEqual(MIGHT_LIKE_MIN_SCORE);
    expect(result.reason).toEqual({ kind: "series", count: 5 });
  });

  test("an interest match 3 months out is for you but not in the top section", () => {
    const event = upcoming("law", 90, {
      tags: [{ tagId: "law", confidence: 0.9 }],
    });
    const [result] = scoreEvents(
      [event],
      { interests: ["law"], interactions: [] },
      NOW,
    );
    expect(result.affinity).toBeGreaterThanOrEqual(FOR_YOU_MIN_AFFINITY);
    expect(result.score).toBeLessThan(MIGHT_LIKE_MIN_SCORE);
  });

  test("a single mild interest match this week isn't in the top section", () => {
    const event = upcoming("social", 2, {
      tags: [{ tagId: "social", confidence: 0.7 }],
    });
    const [result] = scoreEvents(
      [event],
      { interests: ["social"], interactions: [] },
      NOW,
    );
    expect(result.score).toBeLessThan(MIGHT_LIKE_MIN_SCORE);
  });

  test("a strong match on several interests this week is in the top section", () => {
    const event = upcoming("panel", 3, {
      tags: [
        { tagId: "law", confidence: 0.9 },
        { tagId: "talks", confidence: 0.7 },
      ],
    });
    const [result] = scoreEvents(
      [event],
      { interests: ["law", "talks"], interactions: [] },
      NOW,
    );
    expect(result.score).toBeGreaterThanOrEqual(MIGHT_LIKE_MIN_SCORE);
    expect(result.reason).toEqual({
      kind: "interests",
      tagIds: ["law", "talks"],
    });
  });

  test("unrelated events aren't for you", () => {
    const [result] = scoreEvents(
      [upcoming("other", 1, { tags: [{ tagId: "games", confidence: 0.8 }] })],
      { interests: ["law"], interactions: [] },
      NOW,
    );
    expect(result.affinity).toBe(0);
    expect(result.reason).toEqual({ kind: "none" });
  });

  test("members-only events barely count on interests alone", () => {
    const tags = [{ tagId: "greek", confidence: 0.9 }];
    const user = { interests: ["greek"], interactions: [] };
    const [open] = scoreEvents([upcoming("open", 2, { tags })], user, NOW);
    const [members] = scoreEvents(
      [upcoming("chapter", 2, { tags, audience: "members" })],
      user,
      NOW,
    );
    expect(open.affinity).toBeGreaterThanOrEqual(FOR_YOU_MIN_AFFINITY);
    expect(members.affinity).toBeLessThan(FOR_YOU_MIN_AFFINITY);
  });

  test("members still see their own chapter's meetings", () => {
    const event = upcoming("chapter", 7, {
      seriesKey: "dz|chapter",
      hostIds: ["dz"],
      audience: "members",
    });
    const interactions = [1, 2].map((n) =>
      pastRsvp(`old-${n}`, "dz|chapter", "dz"),
    );
    const [result] = scoreEvents([event], { interests: [], interactions }, NOW);
    expect(result.affinity).toBeGreaterThanOrEqual(FOR_YOU_MIN_AFFINITY);
  });

  test("law school events count for students who picked law", () => {
    const event = upcoming("sba", 2, {
      tags: [{ tagId: "social", confidence: 0.9 }],
      audience: "law",
    });
    const [undergrad] = scoreEvents(
      [event],
      { interests: ["social"], interactions: [] },
      NOW,
    );
    const [lawStudent] = scoreEvents(
      [event],
      { interests: ["social", "law"], interactions: [] },
      NOW,
    );
    expect(undergrad.affinity).toBeLessThan(FOR_YOU_MIN_AFFINITY);
    expect(lawStudent.affinity).toBeGreaterThanOrEqual(FOR_YOU_MIN_AFFINITY);
  });

  test("viewing a page many times counts once", () => {
    const view: Interaction = {
      eventId: "other",
      type: "view",
      eventStartsAt: NOW,
      seriesKey: "x",
      hostIds: ["club"],
    };
    const event = upcoming("e", 1, { hostIds: ["club"] });
    const once = scoreEvents(
      [event],
      { interests: [], interactions: [view] },
      NOW,
    );
    const many = scoreEvents(
      [event],
      { interests: [], interactions: [view, view, view] },
      NOW,
    );
    expect(many[0].affinity).toBe(once[0].affinity);
  });
});

describe("pickSections", () => {
  test("orders the top section by score and caps it", () => {
    const scores = Array.from({ length: 12 }, (_, n) => ({
      eventId: `e${n}`,
      affinity: 5,
      score: 1.2 + n / 10,
      reason: { kind: "none" } as const,
    }));
    const { mightLike, forYou } = pickSections(scores);
    expect(mightLike).toHaveLength(6);
    expect(mightLike[0].eventId).toBe("e11");
    expect(forYou).toHaveLength(12);
  });
});
