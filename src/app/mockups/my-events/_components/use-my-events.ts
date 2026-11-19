"use client";

import { useState } from "react";
import { groupEvents, INITIAL_EVENTS, type MyEvent } from "./my-events-data";

export type EventChanges = Pick<
  MyEvent,
  "title" | "description" | "startsAt" | "endsAt" | "location"
>;

/**
 * The leader's events, held in memory so edits and cancellations show up
 * right away (nothing persists). `empty` previews a leader with no events.
 */
export function useMyEvents() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [empty, setEmpty] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const visible = empty ? [] : events;

  function saveEvent(id: string, changes: EventChanges) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, ...changes } : event,
      ),
    );
    setNotice(`Changes to ${changes.title} saved. They're live on the feed.`);
  }

  function cancelEvent(id: string) {
    const event = events.find((item) => item.id === id);
    setEvents((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item,
      ),
    );
    if (event) {
      setNotice(`${event.title} cancelled. It's no longer on the feed.`);
    }
  }

  return {
    events: visible,
    groups: groupEvents(visible),
    empty,
    setEmpty,
    notice,
    clearNotice: () => setNotice(null),
    saveEvent,
    cancelEvent,
  };
}
