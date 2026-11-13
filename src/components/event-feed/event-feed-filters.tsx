"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEventFeed } from "./event-feed-context";

/** "All", "Free food", then one pill per topic. Scrolls sideways on phones. */
export function EventFeedFilters() {
  const {
    state: { filterId },
    actions: { setFilter },
    meta: { filters },
  } = useEventFeed();

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ToggleGroup
        variant="outline"
        spacing={1.5}
        value={[filterId]}
        // Clicking the active pill again reports []; keep it selected.
        onValueChange={([value]) => value && setFilter(value)}
        aria-label="Filter events"
      >
        {filters.map((filter) => (
          <ToggleGroupItem
            key={filter.id}
            value={filter.id}
            className="h-7 rounded-full px-3 text-xs text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground"
          >
            {filter.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

/** "14 events", or "3 of 14" while searching or filtering. */
export function EventFeedCount() {
  const {
    state: { visibleEvents },
    meta: { totalCount },
  } = useEventFeed();

  const text =
    visibleEvents.length === totalCount
      ? `${totalCount} ${totalCount === 1 ? "event" : "events"}`
      : `${visibleEvents.length} of ${totalCount}`;

  return (
    <span
      className="text-sm text-muted-foreground tabular-nums"
      aria-live="polite"
    >
      {text}
    </span>
  );
}
