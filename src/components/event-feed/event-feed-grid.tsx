"use client";

import { CalendarXIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { EventCard } from "./event-card";
import { useEventFeed } from "./event-feed-context";

/** Cards in the first row or so load immediately instead of lazily. */
const EAGER_CARD_COUNT = 4;

/** One card per row on phones, up to four on wide screens. */
export function EventFeedGrid() {
  const {
    state: { visibleEvents },
    meta: { totalCount },
  } = useEventFeed();

  if (totalCount === 0) return <NoEventsYet />;
  if (visibleEvents.length === 0) return <NoMatches />;

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {visibleEvents.map((event, index) => (
        <EventCard
          key={event.id}
          event={event}
          loading={index < EAGER_CARD_COUNT ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}

function NoEventsYet() {
  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarXIcon />
        </EmptyMedia>
        <EmptyTitle>No upcoming events yet</EmptyTitle>
        <EmptyDescription>
          Events are copied from RattlerTracks every morning. Check back soon.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function NoMatches() {
  const {
    state: { query },
    actions: { clearSearchAndFilter },
  } = useEventFeed();

  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>
          {query ? `No events match "${query}"` : "No events match this filter"}
        </EmptyTitle>
        <EmptyDescription>
          Try a club name, a building, or a different filter.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={clearSearchAndFilter}>
          Show all events
        </Button>
      </EmptyContent>
    </Empty>
  );
}
