import type { ReactNode } from "react";
import { EventFeed } from "./event-feed";

/**
 * Every upcoming event with topic filters: the /events page, and the home
 * page for visitors we can't personalize for yet. Must be inside
 * `<EventFeed.Provider>`.
 */
export function AllEvents({
  lastSynced,
  notice,
}: {
  lastSynced: string | null;
  /** A line above the list, e.g. inviting the visitor to pick interests. */
  notice?: ReactNode;
}) {
  return (
    <>
      {notice ? <div className="mb-6">{notice}</div> : null}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Upcoming events
          </h1>
          <EventFeed.Count />
        </div>
        <EventFeed.Filters />
      </div>

      <EventFeed.Grid />
      <LastSynced lastSynced={lastSynced} />
    </>
  );
}

/** Small print at the bottom of the feed: when events were last copied over. */
export function LastSynced({ lastSynced }: { lastSynced: string | null }) {
  if (!lastSynced) return null;
  return (
    <p className="mt-16 text-xs text-muted-foreground">
      From RattlerTracks, updated {lastSynced}
    </p>
  );
}
