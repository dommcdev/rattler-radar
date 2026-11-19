import "server-only";

import { formatDateParts, formatWhen } from "@/lib/events/format";
import {
  MOCK_CLUB,
  MOCK_ORGANIZER_EVENTS,
  MOCK_QUICK_ACTIVITIES,
  MOCK_REMOVED_EVENTS,
  MOCK_REPORTS,
} from "../../_lib/data";
import { getMockEvents } from "../../_lib/get-mock-events";
import type { AdminData, Listing } from "./types";

/** Admin-only extras: what students wrote on their quick activities. */
const QUICK_ACTIVITY_NOTES: Record<string, string> = {
  "q-4": "Casual 7v7, all levels. Bring a white and a dark shirt.",
  "q-5":
    "Going over chapters 9 to 14. Bring your notes; we'll split the review sheet.",
  "q-7":
    "Got 4 floor tickets for the Saturday show, $80 each, cash or Venmo. DM me on Instagram before they're gone!!",
};

/**
 * Every listing an admin can see, in one shape: synced RattlerTracks events,
 * events clubs published here, and quick activities students posted. Reports
 * are attached to the listing they're about.
 */
export async function getAdminData(): Promise<AdminData> {
  const { events, lastSynced } = await getMockEvents();

  const synced: Listing[] = events.map((event) => ({
    id: event.id,
    kind: "rattlertracks",
    title: event.title,
    postedBy: event.hosts.map((host) => host.name).join(", ") || "Unknown host",
    startsAt: event.startsAt,
    start: event.start,
    when: event.when,
    location: event.location,
    imageUrl: event.imageUrl,
    descriptionHtml: event.descriptionHtml,
    hasFreeFood: event.hasFreeFood,
    reports: [],
  }));

  const club: Listing[] = MOCK_ORGANIZER_EVENTS.filter(
    (event) => event.source === "manual" && event.status === "published",
  ).map((event) => ({
    id: event.id,
    kind: "club",
    title: event.title,
    postedBy: MOCK_CLUB.name,
    startsAt: event.startsAt,
    start: formatDateParts(event.startsAt),
    when: formatWhen(event.startsAt, event.endsAt),
    location: event.location,
    imageUrl: null,
    descriptionHtml: null,
    hasFreeFood: false,
    reports: [],
  }));

  const quick: Listing[] = MOCK_QUICK_ACTIVITIES.map((activity) => ({
    id: activity.id,
    kind: "quick",
    title: activity.title,
    postedBy: activity.postedBy,
    startsAt: activity.startsAt,
    start: formatDateParts(activity.startsAt),
    when: formatWhen(activity.startsAt, null),
    location: activity.location,
    imageUrl: null,
    descriptionHtml: QUICK_ACTIVITY_NOTES[activity.id]
      ? `<p>${QUICK_ACTIVITY_NOTES[activity.id]}</p>`
      : null,
    hasFreeFood: false,
    reports: [],
  }));

  const listings = [...synced, ...club, ...quick].toSorted(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
  );
  for (const report of MOCK_REPORTS) {
    listings
      .find((listing) => listing.id === report.eventId)
      ?.reports.push(report);
  }

  const removed = MOCK_REMOVED_EVENTS.map((entry) => {
    const startsAt = "2026-11-20T00:00:00.000Z";
    return {
      listing: {
        id: entry.id,
        kind: "rattlertracks" as const,
        title: entry.title,
        postedBy: "Student Government Association",
        startsAt,
        start: formatDateParts(startsAt),
        when: formatWhen(startsAt, "2026-11-20T02:00:00.000Z"),
        location: "University Center Ballroom",
        imageUrl: null,
        descriptionHtml: null,
        hasFreeFood: false,
        reports: [],
      },
      removedAt: entry.removedAt,
      removedBy: entry.removedBy,
      reason: entry.reason,
    };
  });

  return { listings, removed, lastSynced };
}
