import Link from "next/link";
import type { FeedEvent } from "@/lib/events/feed-event";
import { cn } from "@/lib/utils";
import { EventFlyer, FlyerPlaceholder } from "./event-flyer";
import { FreeFoodIcon } from "./free-food-badge";

/** Must match `FEATURED_GRID_CLASS`. */
const FLYER_SIZES = "(min-width: 1536px) 33vw, (min-width: 640px) 50vw, 100vw";
const FLYER_FRAME = "aspect-[5/3] rounded-lg ring-1 ring-border";

/** One card per row on phones, two on tablets and laptops, three on wide screens. */
export const FEATURED_GRID_CLASS =
  "grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 2xl:grid-cols-3";

/**
 * A bigger `EventCard` for "Events you might like": larger flyer and title,
 * and the hosts, since a club the student knows is a reason to go.
 * The whole card is clickable through the title's stretched link.
 */
export function FeaturedEventCard({
  event,
  loading = "lazy",
  className,
}: {
  event: FeedEvent;
  loading?: "eager" | "lazy";
  className?: string;
}) {
  const hosts = event.hosts.map((host) => host.name).join(", ");

  return (
    <article className={cn("group relative", className)}>
      {event.imageUrl ? (
        <EventFlyer
          src={event.imageUrl}
          sizes={FLYER_SIZES}
          loading={loading}
          className={`${FLYER_FRAME} transition-shadow group-hover:ring-foreground/25`}
        />
      ) : (
        <FlyerPlaceholder label={hosts} className={FLYER_FRAME} />
      )}

      <div className="mt-4 flex gap-4">
        <time
          dateTime={event.startsAt}
          className="flex w-11 shrink-0 flex-col items-center"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {event.start.month}
          </span>
          <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {event.start.day}
          </span>
        </time>
        <div className="min-w-0 border-l pl-4">
          <h3 className="text-xl leading-snug font-semibold tracking-tight">
            <Link
              href={`/events/${event.id}`}
              className="line-clamp-2 text-left outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4 after:absolute after:-inset-2 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {event.title}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[15px] text-muted-foreground">
            <span className="shrink-0">{event.start.time}</span>
            <span aria-hidden className="text-muted-foreground/50">
              ·
            </span>
            <span className="truncate">
              {event.location ?? "Location to be announced"}
            </span>
            {event.hasFreeFood ? <FreeFoodIcon /> : null}
          </p>
          {hosts ? (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {hosts}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
