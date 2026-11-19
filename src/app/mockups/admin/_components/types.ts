import type { EventReport } from "../../_lib/data";

export type ListingKind = "rattlertracks" | "club" | "quick";

export const KIND_LABELS: Record<ListingKind, string> = {
  rattlertracks: "RattlerTracks",
  club: "Club event",
  quick: "Quick activity",
};

/** Anything that shows up in the student feed, ready to display. */
export interface Listing {
  id: string;
  kind: ListingKind;
  title: string;
  /** Hosting clubs, or the student who posted a quick activity. */
  postedBy: string;
  startsAt: string;
  start: { month: string; day: string; time: string };
  when: { date: string; time: string };
  location: string | null;
  imageUrl: string | null;
  descriptionHtml: string | null;
  hasFreeFood: boolean;
  reports: EventReport[];
}

export interface RemovedListing {
  listing: Listing;
  removedAt: string;
  removedBy: string;
  reason: string;
}

export interface AdminData {
  listings: Listing[];
  removed: RemovedListing[];
  lastSynced: string | null;
}
