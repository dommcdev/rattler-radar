import { z } from "zod";
import type { RawEvent } from "./schema";

const EVENT_PAGE_BASE_URL = "https://stmarytx.campuslabs.com/engage/event";
const IMAGE_BASE_URL = "https://se-images.campuslabs.com/clink/images";

export const eventHostSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type EventHost = z.infer<typeof eventHostSchema>;

/**
 * An event from RattlerTracks in our own format. Optional fields that are
 * missing upstream are `null`; list fields are empty arrays.
 *
 * Defined as a schema so stored events can be validated when read back.
 */
export const rattlerTracksEventSchema = z.object({
  /** The RattlerTracks event id, which uniquely identifies the event there. */
  sourceId: z.string(),
  url: z.url(),
  title: z.string(),
  /** Raw HTML from RattlerTracks. Must be sanitized before rendering. */
  descriptionHtml: z.string().nullable(),
  /** ISO 8601 timestamp in UTC. */
  startsAt: z.iso.datetime(),
  /** ISO 8601 timestamp in UTC. */
  endsAt: z.iso.datetime().nullable(),
  location: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  imageUrl: z.url().nullable(),
  hosts: z.array(eventHostSchema),
  theme: z.string().nullable(),
  categories: z.array(z.string()),
  benefits: z.array(z.string()),
  rsvpCount: z.number().int().nullable(),
});

export type RattlerTracksEvent = z.infer<typeof rattlerTracksEventSchema>;

export function normalizeEvent(raw: RawEvent): RattlerTracksEvent {
  const imagePath = cleanText(raw.imagePath);

  return {
    sourceId: raw.id,
    url: `${EVENT_PAGE_BASE_URL}/${raw.id}`,
    title: raw.name,
    descriptionHtml: cleanText(raw.description),
    startsAt: toUtcIso(raw.startsOn),
    endsAt: raw.endsOn ? toUtcIso(raw.endsOn) : null,
    location: cleanText(raw.location),
    latitude: parseCoordinate(raw.latitude),
    longitude: parseCoordinate(raw.longitude),
    imageUrl: imagePath ? `${IMAGE_BASE_URL}/${imagePath}` : null,
    hosts: toHosts(raw),
    theme: cleanText(raw.theme),
    categories: cleanList(raw.categoryNames),
    benefits: cleanList(raw.benefitNames),
    rsvpCount: raw.rsvpTotal ?? null,
  };
}

/**
 * Co-hosted events list every host in `organizationIds`/`organizationNames`;
 * otherwise those are empty and the single host is in `organizationId`/`organizationName`.
 */
function toHosts(raw: RawEvent): EventHost[] {
  const ids = raw.organizationIds ?? [];
  const names = raw.organizationNames ?? [];

  if (ids.length > 0 && ids.length === names.length) {
    return ids.map((id, i) => ({ id, name: names[i].trim() }));
  }

  const name = cleanText(raw.organizationName);
  if (raw.organizationId != null && name) {
    return [{ id: String(raw.organizationId), name }];
  }

  return [];
}

/** Trims whitespace (RattlerTracks text often has stray spaces/tabs) and turns blanks into null. */
function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanList(values: string[] | null | undefined): string[] {
  return (values ?? []).map((v) => v.trim()).filter((v) => v.length > 0);
}

function parseCoordinate(value: string | null | undefined): number | null {
  const text = cleanText(value);
  if (text === null) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function toUtcIso(value: string): string {
  return new Date(value).toISOString();
}
