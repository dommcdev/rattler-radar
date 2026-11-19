"use client";

import { useEffect } from "react";
import { recordEventInteraction } from "@/lib/interaction-actions";

/** Records that the student opened this event's page. Renders nothing. */
export function TrackEventView({ eventId }: { eventId: string }) {
  useEffect(() => {
    recordEventInteraction(eventId, "view").catch(() => {
      // Tracking is best effort; never bother the student about it.
    });
  }, [eventId]);
  return null;
}
