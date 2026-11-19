import Link from "next/link";
import type { FeedEvent } from "@/lib/events/feed-event";
import { cn } from "@/lib/utils";
import { EventFlyer, FlyerPlaceholder } from "./event-flyer";
import { FreeFoodIcon } from "./free-food-badge";

/** Must match the grid's columns in `event-feed-grid.tsx`. */
const FLYER_SIZES =
  "(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";
/** 5:3 is the shape RattlerTracks crops event images to, so most fill it exactly. */
const FLYER_FRAME = "aspect-[5/3] rounded-md ring-1 ring-border";

interface EventCardProps {
  event: FeedEvent;
  /** Load the flyer right away (for cards visible without scrolling). */
  loading?: "eager" | "lazy";
}

/**
 * Flyer, then a month/day stamp beside two single lines: the title (cut off
 * if long, so every card is the same height) and "time · host". Location
 * and the description live on the event's page.
 *
 * The whole card is clickable: the title's link stretches over the card
 * with an `after:` overlay, so the link's accessible name is just the title.
 */
export function EventCard({ event, loading = "lazy" }: EventCardProps) {
  return (
    <article className="group relative">
      {event.imageUrl ? (
        <EventFlyer
          src={event.imageUrl}
          sizes={FLYER_SIZES}
          loading={loading}
          className={`${FLYER_FRAME} transition-shadow group-hover:ring-foreground/25`}
        />
      ) : (
        <FlyerPlaceholder
          label={event.hosts.map((host) => host.name).join(", ")}
          className={FLYER_FRAME}
        />
      )}

      <div className="mt-3.5 flex gap-3.5">
        <DateStamp event={event} />
        <div className="min-w-0 border-l pl-3.5">
          <h3 className="text-[15px] leading-snug font-semibold tracking-tight">
            <Link
              href={`/events/${event.id}`}
              className="block truncate text-left outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4 after:absolute after:-inset-2 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {event.title}
            </Link>
          </h3>
          <TimeAndHost event={event} className="mt-1 text-sm" />
        </div>
      </div>
    </article>
  );
}

/** Month over day, like a tear-off calendar. */
export function DateStamp({
  event,
  size = "default",
}: {
  event: FeedEvent;
  size?: "default" | "lg";
}) {
  const large = size === "lg";
  return (
    <time
      dateTime={event.startsAt}
      className={cn(
        "flex shrink-0 flex-col items-center",
        large ? "w-11" : "w-9",
      )}
    >
      <span
        className={cn(
          "font-medium text-muted-foreground",
          large ? "text-xs" : "text-[11px]",
        )}
      >
        {event.start.month}
      </span>
      <span
        className={cn(
          "leading-none font-semibold tracking-tight tabular-nums",
          large ? "text-3xl" : "text-2xl",
        )}
      >
        {event.start.day}
      </span>
    </time>
  );
}

/** "3:30 PM · Psi Chi", plus the free food pizza if there is any. */
export function TimeAndHost({
  event,
  className,
}: {
  event: FeedEvent;
  className?: string;
}) {
  const hosts = event.hosts.map((host) => host.name).join(", ");
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-muted-foreground",
        className,
      )}
    >
      <span className="shrink-0">{event.start.time}</span>
      {hosts ? (
        <>
          <span aria-hidden className="text-muted-foreground/50">
            ·
          </span>
          <span className="truncate">{hosts}</span>
        </>
      ) : null}
      {event.hasFreeFood ? <FreeFoodIcon /> : null}
    </p>
  );
}
