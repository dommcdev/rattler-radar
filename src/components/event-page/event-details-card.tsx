import { CalendarIcon, MapPinIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { FeedEvent } from "@/lib/events/feed-event";
import { directionsUrl, googleCalendarUrl } from "@/lib/events/links";
import { cn } from "@/lib/utils";
import { PerkIcon, perkLabel } from "./perks";
import { RsvpLink } from "./rsvp-link";

/**
 * The event page's practical half: when, where, and how to go. Reads top to
 * bottom in that order, with the date as the biggest thing in the card, and
 * the event's perks (free food, etc.) as pills underneath.
 */
export function EventDetailsCard({ event }: { event: FeedEvent }) {
  return (
    <>
      <div className="rounded-lg border bg-card">
        {/* When */}
        <div className="flex items-center gap-4 p-4">
          <CalendarTile event={event} />
          <div className="min-w-0">
            <p className="font-semibold tracking-tight">{event.when.date}</p>
            <p className="text-sm text-muted-foreground">{event.when.time}</p>
          </div>
        </div>

        {/* Where */}
        <div className="flex items-center gap-4 border-t p-4">
          {/* Same width as the calendar tile, so the text lines up. */}
          <span className="flex w-14 shrink-0 justify-center text-muted-foreground">
            <MapPinIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold tracking-tight">
              {event.location ?? "Location to be announced"}
            </p>
            <p className="text-sm text-muted-foreground">
              St. Mary's University
            </p>
          </div>
          {event.location ? (
            <a
              href={directionsUrl(event.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 self-start text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Directions
            </a>
          ) : null}
        </div>

        {/* Go */}
        <div className="space-y-2 border-t p-4">
          <RsvpLink eventId={event.id} url={event.url} />
          {/* A link styled as a button (Base UI's Button is for buttons only). */}
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "w-full",
            })}
          >
            <CalendarIcon data-icon="inline-start" />
            Add to calendar
          </a>
          {event.rsvpCount ? (
            <p className="pt-1 text-center text-sm text-muted-foreground">
              <GoingCount count={event.rsvpCount} />
            </p>
          ) : null}
        </div>
      </div>

      {/* Perks, as pills. Free food (the big draw) gets a gold tint. */}
      {event.benefits.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {event.benefits.map((benefit) => (
            <li
              key={benefit}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-medium",
                benefit === "Free Food" && "border-gold/40 bg-gold/10",
              )}
            >
              <PerkIcon benefit={benefit} />
              {perkLabel(benefit)}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function GoingCount({ count }: { count: number }) {
  return (
    <span>
      <span className="font-medium text-foreground tabular-nums">{count}</span>{" "}
      going
    </span>
  );
}

/** A tear-off calendar page: month on top, day below. */
function CalendarTile({ event }: { event: FeedEvent }) {
  return (
    <time
      dateTime={event.startsAt}
      className="flex w-14 shrink-0 flex-col overflow-hidden rounded-md border text-center"
    >
      <span className="bg-muted py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {event.start.month}
      </span>
      <span className="py-1.5 text-2xl leading-none font-semibold tabular-nums">
        {event.start.day}
      </span>
    </time>
  );
}
