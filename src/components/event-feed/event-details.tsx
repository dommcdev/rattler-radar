"use client";

import { LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { FeedEvent } from "@/lib/events/feed-event";
import { useEventFeed } from "./event-feed-context";
import { EventFlyer } from "./event-flyer";
import { FreeFoodBadge } from "./free-food-badge";

/** Side panel with everything about the event the student clicked. */
export function EventFeedDetails() {
  const {
    state: { selectedEvent, isDetailsOpen },
    actions: { closeEvent },
  } = useEventFeed();

  return (
    <Sheet open={isDetailsOpen} onOpenChange={(open) => !open && closeEvent()}>
      <SheetContent className="w-full gap-0 overflow-y-auto text-sm sm:max-w-md">
        {selectedEvent ? <EventDetails event={selectedEvent} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function EventDetails({ event }: { event: FeedEvent }) {
  return (
    <>
      <SheetHeader className="gap-3 p-5 pr-12">
        <SheetTitle className="text-lg leading-snug font-semibold tracking-tight text-balance">
          {event.title}
        </SheetTitle>
        <SheetDescription className="text-sm">
          <time dateTime={event.startsAt}>{event.schedule}</time>
        </SheetDescription>
      </SheetHeader>

      {event.imageUrl ? (
        <EventFlyer
          src={event.imageUrl}
          sizes="(min-width: 640px) 448px, 100vw"
          className="mx-5 aspect-[5/3] rounded-md ring-1 ring-border"
        />
      ) : null}

      <dl className="mx-5 mt-5 divide-y divide-border border-y">
        <Property label="Where">{event.location ?? "To be announced"}</Property>
        <Property label="Hosted by">{event.hosts.join(", ")}</Property>
        {event.topic || event.categories.length > 0 ? (
          <Property label="Tags">
            <span className="flex flex-wrap gap-1">
              {[event.topic, ...event.categories].filter(Boolean).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </span>
          </Property>
        ) : null}
        {event.hasFreeFood ? (
          <Property label="Perks">
            <FreeFoodBadge />
          </Property>
        ) : null}
        {event.rsvpCount ? (
          <Property label="Going">{event.rsvpCount} students</Property>
        ) : null}
      </dl>

      {event.descriptionHtml ? (
        <div
          className="mx-5 mt-5 space-y-3 leading-relaxed text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:text-foreground [&_ul]:list-disc"
          // Sanitized on the server in get-event-feed.ts.
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized HTML
          dangerouslySetInnerHTML={{ __html: event.descriptionHtml }}
        />
      ) : null}

      <SheetFooter className="p-5">
        <Button asChild size="lg" className="w-full">
          <a href={event.url} target="_blank" rel="noopener noreferrer">
            RSVP on RattlerTracks
            <HugeiconsIcon icon={LinkSquare02Icon} data-icon="inline-end" />
          </a>
        </Button>
      </SheetFooter>
    </>
  );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
