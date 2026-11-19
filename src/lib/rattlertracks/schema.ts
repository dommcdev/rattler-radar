import { z } from "zod";

/**
 * Shape of the RattlerTracks (Campus Labs Engage) event search API.
 *
 * This API is undocumented, so these schemas are our contract with it: if
 * the response stops matching, we want a loud validation error rather than
 * silently saving bad data. Only the fields we use are listed; zod strips
 * any extra fields.
 */

const isoDateTime = z.iso.datetime({ offset: true });

/** A single event as returned by the API, before normalization. */
export const rawEventSchema = z.object({
  // Required: an event without these isn't useful to us.
  id: z.string().min(1),
  name: z.string().trim().min(1),
  startsOn: isoDateTime,

  // Optional: missing values become explicit nulls during normalization.
  endsOn: isoDateTime.nullish(),
  description: z.string().nullish(),
  location: z.string().nullish(),
  latitude: z.string().nullish(),
  longitude: z.string().nullish(),
  imagePath: z.string().nullish(),
  organizationId: z.number().nullish(),
  organizationName: z.string().nullish(),
  organizationIds: z.array(z.string()).nullish(),
  organizationNames: z.array(z.string()).nullish(),
  benefitNames: z.array(z.string()).nullish(),
  rsvpTotal: z.number().int().nullish(),
});

export type RawEvent = z.infer<typeof rawEventSchema>;

/**
 * The response envelope. Events are left as `unknown` here so that one
 * malformed event can be skipped without rejecting the whole page.
 */
export const searchResponseSchema = z.object({
  "@odata.count": z.number().int().nonnegative(),
  value: z.array(z.unknown()),
});

export type SearchResponse = z.infer<typeof searchResponseSchema>;
