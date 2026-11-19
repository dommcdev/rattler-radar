/**
 * What the tagger (`tag-event.ts`) writes, for code that reads tags without
 * pulling in the AI SDK.
 */

/**
 * Who an event is for. "members": only the host's members, officers, or
 * invited guests. Stored in the database, so don't rename these.
 */
export const AUDIENCES = ["everyone", "undergrad", "law", "members"] as const;
export type Audience = (typeof AUDIENCES)[number];

/** Tags at or above this show on the event and match its filter pill. */
export const SHOWN_TAG_MIN_CONFIDENCE = 0.5;

/** Perks in RattlerTracks' own names, so Jev's merge with the organizer's. */
export const FREE_FOOD = "Free Food";
export const FREE_STUFF = "Free Stuff";
