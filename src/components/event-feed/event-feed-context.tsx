"use client";

import {
  createContext,
  type ReactNode,
  use,
  useDeferredValue,
  useState,
} from "react";
import type { FeedEvent } from "@/lib/events/feed-event";
import { interestLabel } from "@/lib/interests";

/** A filter chip: which events it keeps. */
export interface FeedFilter {
  id: string;
  label: string;
  matches: (event: FeedEvent) => boolean;
}

interface EventFeedContextValue {
  state: {
    query: string;
    filterId: string;
    /** Events matching the current search and filter. */
    visibleEvents: FeedEvent[];
  };
  actions: {
    setQuery: (query: string) => void;
    setFilter: (filterId: string) => void;
    clearSearchAndFilter: () => void;
  };
  meta: {
    /** Every event given to the provider. */
    events: FeedEvent[];
    filters: FeedFilter[];
    totalCount: number;
  };
}

const EventFeedContext = createContext<EventFeedContextValue | null>(null);

export function useEventFeed(): EventFeedContextValue {
  const context = use(EventFeedContext);
  if (!context) {
    throw new Error("EventFeed components must be inside <EventFeed.Provider>");
  }
  return context;
}

const ALL_FILTER_ID = "all";

/** "All" and "Free food", then one filter per tag, most common first. */
function buildFilters(events: FeedEvent[]): FeedFilter[] {
  const tagCounts = new Map<string, number>();
  for (const event of events) {
    for (const tagId of event.tags) {
      tagCounts.set(tagId, (tagCounts.get(tagId) ?? 0) + 1);
    }
  }
  const tagIds = [...tagCounts.entries()]
    .toSorted(([, a], [, b]) => b - a)
    .map(([tagId]) => tagId);

  return [
    { id: ALL_FILTER_ID, label: "All", matches: () => true },
    { id: "free-food", label: "Free food", matches: (e) => e.hasFreeFood },
    ...tagIds.map((tagId) => ({
      id: `tag:${tagId}`,
      label: interestLabel(tagId),
      matches: (e: FeedEvent) => e.tags.includes(tagId),
    })),
  ];
}

function searchableText(event: FeedEvent): string {
  return [
    event.title,
    event.location,
    ...event.hosts.map((host) => host.name),
    ...event.tags.map(interestLabel),
    ...event.benefits,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

// Memoization is left to the React Compiler (enabled in next.config.ts).
export function EventFeedProvider({
  events,
  children,
}: {
  events: FeedEvent[];
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filterId, setFilterId] = useState(ALL_FILTER_ID);

  const filters = buildFilters(events);
  const activeFilter = filters.find((f) => f.id === filterId) ?? filters[0];

  // Typing stays responsive; the grid catches up a moment later if needed.
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const visibleEvents = events.filter(
    (event) =>
      activeFilter.matches(event) &&
      searchableText(event).includes(deferredQuery),
  );

  const value: EventFeedContextValue = {
    state: { query, filterId, visibleEvents },
    actions: {
      setQuery,
      setFilter: setFilterId,
      clearSearchAndFilter: () => {
        setQuery("");
        setFilterId(ALL_FILTER_ID);
      },
    },
    meta: { events, filters, totalCount: events.length },
  };

  return <EventFeedContext value={value}>{children}</EventFeedContext>;
}
