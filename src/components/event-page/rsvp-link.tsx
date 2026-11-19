"use client";

import { ExternalLinkIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { recordEventInteraction } from "@/lib/interaction-actions";

/** The RSVP button. Clicking it is our best sign (for now) that a student is going. */
export function RsvpLink({ eventId, url }: { eventId: string; url: string }) {
  return (
    // A link styled as a button (Base UI's Button is for buttons only).
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        recordEventInteraction(eventId, "rsvp_click").catch(() => {});
      }}
      className={buttonVariants({ size: "lg", className: "w-full" })}
    >
      RSVP on RattlerTracks
      <ExternalLinkIcon data-icon="inline-end" />
    </a>
  );
}
