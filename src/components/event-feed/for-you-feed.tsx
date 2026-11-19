"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type {
  FeedEvent,
  PersonalFeed,
  TimeGroup,
} from "@/lib/events/feed-event";
import { LastSynced } from "./all-events";
import { EventCard } from "./event-card";
import { EventFeed } from "./event-feed";
import { useEventFeed } from "./event-feed-context";
import { EVENT_GRID_CLASS } from "./event-feed-grid";
import { FEATURED_GRID_CLASS, FeaturedEventCard } from "./featured-event-card";

type ReadyFeed = Extract<PersonalFeed, { kind: "ready" }>;

/**
 * The signed-in home page: "Events you might like" (the few the student is
 * most likely to want, even if they're weeks out), then every "for you"
 * event in time order. Searching swaps both for results from all events.
 * Must be inside `<EventFeed.Provider>`, which holds every upcoming event.
 */
export function ForYouFeed({
  feed,
  lastSynced,
}: {
  feed: ReadyFeed;
  lastSynced: string | null;
}) {
  const {
    state: { query },
    meta: { events },
  } = useEventFeed();

  if (query.trim()) return <SearchResults />;

  const eventsById = new Map(events.map((event) => [event.id, event]));
  const mightLike = feed.mightLike.flatMap(
    ({ id }) => eventsById.get(id) ?? [],
  );
  const otherCount = events.length - feed.forYou.length;
  // Events already featured above aren't repeated below.
  const featured = new Set(mightLike.map((event) => event.id));
  const more = feed.forYou.flatMap(({ id, group }) => {
    const event = eventsById.get(id);
    return event && !featured.has(id) ? [{ event, group }] : [];
  });
  const hasFeatured = mightLike.length > 0;

  return (
    <>
      {hasFeatured ? (
        <section aria-labelledby="might-like" className="mb-20">
          <h1
            id="might-like"
            className="mb-6 text-2xl font-semibold tracking-tight"
          >
            Events you might like
          </h1>
          <div className={FEATURED_GRID_CLASS}>
            {mightLike.map((event, index) => (
              <FeaturedEventCard
                key={event.id}
                event={event}
                loading={index < 2 ? "eager" : "lazy"}
                className={twoRowsOnly(index)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="more-events">
        <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {hasFeatured ? (
            <h2
              id="more-events"
              className="text-lg font-semibold tracking-tight"
            >
              More events for you
            </h2>
          ) : (
            <h1
              id="more-events"
              className="text-2xl font-semibold tracking-tight"
            >
              Upcoming events for you
            </h1>
          )}
          <Link
            href="/events"
            className="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            View all events
            <ArrowRightIcon aria-hidden className="size-3.5" />
          </Link>
        </div>

        {more.length > 0 ? (
          <TimeGroups items={more} eagerCount={hasFeatured ? 0 : 4} />
        ) : (
          <p className="text-[15px] text-muted-foreground">
            {hasFeatured
              ? "That's everything for you right now."
              : "Nothing coming up matches your interests yet."}
          </p>
        )}

        {otherCount > 0 ? (
          <p className="mt-14 border-t pt-6 text-[15px] text-muted-foreground">
            {otherCount === 1
              ? "1 more upcoming event isn't in your interests. "
              : `${otherCount} more upcoming events aren't in your interests. `}
            <Link
              href="/events"
              className="font-medium text-foreground underline underline-offset-4"
            >
              See all events
            </Link>
          </p>
        ) : null}
      </section>

      <LastSynced lastSynced={lastSynced} />
    </>
  );
}

const GROUP_LABELS: Record<Exclude<TimeGroup, "soon">, string> = {
  "next-month": "Next month",
  distant: "Distant future",
};

/** Soonest first. The next 30 days have no header; later ones do. */
function TimeGroups({
  items,
  eagerCount,
}: {
  items: { event: FeedEvent; group: TimeGroup }[];
  eagerCount: number;
}) {
  const groups = (["soon", "next-month", "distant"] as const)
    .map((group) => ({
      group,
      events: items.filter((item) => item.group === group).map((i) => i.event),
    }))
    .filter(({ events }) => events.length > 0);

  return (
    <div className="space-y-12">
      {groups.map(({ group, events }, groupIndex) => (
        <div key={group}>
          {group !== "soon" ? (
            <h3 className="mb-5 text-sm font-medium text-muted-foreground">
              {GROUP_LABELS[group]}
            </h3>
          ) : null}
          <div className={EVENT_GRID_CLASS}>
            {events.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                loading={
                  groupIndex === 0 && index < eagerCount ? "eager" : "lazy"
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * At most two rows at every width: the featured grid has 1, 2, then 3
 * columns, so cards past 2 and 4 are hidden until the screen fits more.
 */
function twoRowsOnly(index: number): string | undefined {
  if (index < 2) return undefined;
  if (index < 4) return "hidden sm:block";
  return "hidden 2xl:block";
}

function SearchResults() {
  return (
    <>
      <div className="mb-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Search results
        </h1>
        <EventFeed.Count />
      </div>
      <EventFeed.Grid />
    </>
  );
}
