import { describe, expect, test } from "bun:test";
import { normalizeEvent } from "./normalize";
import { type RawEvent, rawEventSchema } from "./schema";

function parse(overrides: Record<string, unknown> = {}): RawEvent {
  return rawEventSchema.parse({
    id: "12953880",
    name: "Fangs Forward Monthly Meeting",
    startsOn: "2026-11-13T20:00:00+00:00",
    ...overrides,
  });
}

describe("normalizeEvent", () => {
  test("maps a complete event", () => {
    const event = normalizeEvent(
      parse({
        description: "<p>Join us for our monthly meeting!</p>",
        endsOn: "2026-11-13T21:00:00+00:00",
        location: "Reinbolt 101",
        latitude: "29.452910",
        longitude: "-98.561560",
        imagePath: "abc.png",
        organizationId: 428668,
        organizationName: "Fangs Forward",
        organizationIds: [],
        organizationNames: [],
        theme: "GroupBusiness",
        categoryNames: ["Meeting"],
        benefitNames: ["Free Food"],
        rsvpTotal: 4,
      }),
    );

    expect(event).toEqual({
      sourceId: "12953880",
      url: "https://stmarytx.campuslabs.com/engage/event/12953880",
      title: "Fangs Forward Monthly Meeting",
      descriptionHtml: "<p>Join us for our monthly meeting!</p>",
      startsAt: "2026-11-13T20:00:00.000Z",
      endsAt: "2026-11-13T21:00:00.000Z",
      location: "Reinbolt 101",
      latitude: 29.45291,
      longitude: -98.56156,
      imageUrl: "https://se-images.campuslabs.com/clink/images/abc.png",
      hosts: [{ id: "428668", name: "Fangs Forward" }],
      theme: "GroupBusiness",
      categories: ["Meeting"],
      benefits: ["Free Food"],
      rsvpCount: 4,
    });
  });

  test("uses explicit nulls for missing optional fields", () => {
    const event = normalizeEvent(parse({ imagePath: null, location: "  " }));

    expect(event).toMatchObject({
      descriptionHtml: null,
      endsAt: null,
      location: null,
      latitude: null,
      longitude: null,
      imageUrl: null,
      hosts: [],
      theme: null,
      categories: [],
      benefits: [],
      rsvpCount: null,
    });
  });

  test("trims stray whitespace", () => {
    const event = normalizeEvent(
      parse({ name: "\tAlpha Phifa 2026", location: "Law Classroom " }),
    );

    expect(event.title).toBe("Alpha Phifa 2026");
    expect(event.location).toBe("Law Classroom");
  });

  test("converts start times with an offset to UTC", () => {
    const event = normalizeEvent(
      parse({ startsOn: "2026-11-12T17:00:00-06:00" }),
    );

    expect(event.startsAt).toBe("2026-11-12T23:00:00.000Z");
  });

  test("lists every host of a co-hosted event", () => {
    const event = normalizeEvent(
      parse({
        organizationId: 62745,
        organizationName: "Pre-Medical Society ",
        organizationIds: ["62744", "62745"],
        organizationNames: ["Pre-Dental Society ", "Pre-Medical Society "],
      }),
    );

    expect(event.hosts).toEqual([
      { id: "62744", name: "Pre-Dental Society" },
      { id: "62745", name: "Pre-Medical Society" },
    ]);
  });
});

describe("rawEventSchema", () => {
  test("rejects events missing required fields", () => {
    expect(
      rawEventSchema.safeParse({ id: "1", name: "No start" }).success,
    ).toBe(false);
    expect(
      rawEventSchema.safeParse({
        id: "1",
        name: "   ",
        startsOn: "2026-11-13T20:00:00Z",
      }).success,
    ).toBe(false);
  });
});
