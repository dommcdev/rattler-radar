import Link from "next/link";
import type { FeedEvent } from "@/lib/events/feed-event";
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
 * Flyer, then a date stamp beside the title and one quiet line with the time
 * and place. Hosts and the description live on the event's page.
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
              className="line-clamp-2 text-left outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4 after:absolute after:-inset-2 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {event.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="shrink-0">{event.start.time}</span>
            <span aria-hidden className="text-muted-foreground/50">
              ·
            </span>
            <span className="truncate">
              {event.location ?? "Location to be announced"}
            </span>
            {event.hasFreeFood ? <FreeFoodIcon /> : null}
          </p>
        </div>
      </div>
    </article>
  );
}

function DateStamp({ event }: { event: FeedEvent }) {
  return (
    <time
      dateTime={event.startsAt}
      className="flex w-9 shrink-0 flex-col items-center"
    >
      <span className="text-[11px] font-medium text-muted-foreground">
        {event.start.month}
      </span>
      <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {event.start.day}
      </span>
    </time>
  );
}
