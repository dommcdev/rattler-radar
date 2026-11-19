"use client";

import {
  createContext,
  type ReactNode,
  use,
  useDeferredValue,
  useState,
} from "react";
import type { FeedEvent } from "@/lib/events/feed-event";

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

/** "All" and "Free food", then one filter per topic, most common first. */
function buildFilters(events: FeedEvent[]): FeedFilter[] {
  const topicCounts = new Map<string, number>();
  for (const event of events) {
    if (event.topic) {
      topicCounts.set(event.topic, (topicCounts.get(event.topic) ?? 0) + 1);
    }
  }
  const topics = [...topicCounts.entries()]
    .toSorted(([, a], [, b]) => b - a)
    .map(([topic]) => topic);

  return [
    { id: ALL_FILTER_ID, label: "All", matches: () => true },
    { id: "free-food", label: "Free food", matches: (e) => e.hasFreeFood },
    ...topics.map((topic) => ({
      id: `topic:${topic}`,
      label: topic,
      matches: (e: FeedEvent) => e.topic === topic,
    })),
  ];
}

function searchableText(event: FeedEvent): string {
  return [
    event.title,
    event.location,
    event.topic,
    ...event.hosts.map((host) => host.name),
    ...event.categories,
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
