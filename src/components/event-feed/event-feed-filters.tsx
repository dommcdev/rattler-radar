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
        type="single"
        variant="outline"
        spacing={1.5}
        value={filterId}
        // Radix reports "" when the active pill is clicked again; keep it selected.
        onValueChange={(value) => value && setFilter(value)}
        aria-label="Filter events"
      >
        {filters.map((filter) => (
          <ToggleGroupItem
            key={filter.id}
            value={filter.id}
            className="h-7 rounded-full px-3 text-xs text-muted-foreground data-[state=on]:border-foreground/30 data-[state=on]:bg-muted data-[state=on]:text-foreground"
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
