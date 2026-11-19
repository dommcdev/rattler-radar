"use client";

import { CalendarIcon, ExternalLinkIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/event-feed/event-card";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { FreeFoodIcon } from "@/components/event-feed/free-food-badge";
import { buttonVariants } from "@/components/ui/button";
import { googleCalendarUrl } from "@/lib/events/links";
import type { QuickActivity } from "../../_lib/data";
import type { MockEvent } from "../../_lib/get-mock-events";
import {
  formatLongDay,
  formatTime,
  forYouEvents,
  groupByWhen,
  isToday,
  joinLabels,
  MOCK_NOW,
  matchedInterests,
  QUICK_ACTIVITIES,
  reasonText,
  startsIn,
} from "../_lib/feed";
import { GoingCount, JoinButton, useJoin } from "./join-button";

type TodayItem =
  | { kind: "event"; startsAt: string; event: MockEvent }
  | { kind: "activity"; startsAt: string; activity: QuickActivity };

/**
 * Today first: the next matching event big, with one obvious button, then
 * the rest of today (events and quick activities on one timeline), then
 * the coming days as cards.
 */
export function ForYouC({
  events,
  interests,
}: {
  events: MockEvent[];
  interests: string[];
}) {
  const mine = forYouEvents(events, interests);
  const [next, ...rest] = mine;
  const today: TodayItem[] = [
    ...rest
      .filter((event) => isToday(event.startsAt))
      .map((event) => ({
        kind: "event" as const,
        startsAt: event.startsAt,
        event,
      })),
    ...QUICK_ACTIVITIES.filter((a) => isToday(a.startsAt)).map((activity) => ({
      kind: "activity" as const,
      startsAt: activity.startsAt,
      activity,
    })),
  ].toSorted((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  const later = groupByWhen(rest.filter((event) => !isToday(event.startsAt)));
  const hiddenCount = events.length - mine.length;

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-8 pb-28 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Good afternoon, Maya
      </h1>
      <p className="mt-1 max-w-prose text-sm text-muted-foreground">
        {formatLongDay(new Date(MOCK_NOW).toISOString())}. Showing events for{" "}
        {joinLabels(interests)}.{" "}
        <Link
          href="/mockups/settings/a"
          className="text-foreground underline underline-offset-4"
        >
          Edit interests
        </Link>
      </p>

      {next ? <UpNext event={next} interests={interests} /> : null}

      <section aria-labelledby="today-heading" className="mt-14">
        <div className="flex items-center justify-between gap-4 border-b pb-2">
          <h2
            id="today-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Later today
          </h2>
          <Link
            href="/mockups/create-event/a"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            <PlusIcon data-icon="inline-start" />
            Post a quick activity
          </Link>
        </div>
        {today.length > 0 ? (
          <ul className="divide-y">
            {today.map((item) =>
              item.kind === "event" ? (
                <TodayEventRow
                  key={item.event.id}
                  event={item.event}
                  interests={interests}
                />
              ) : (
                <TodayActivityRow
                  key={item.activity.id}
                  activity={item.activity}
                />
              ),
            )}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            Nothing else today. Post a quick activity and see who's free.
          </p>
        )}
      </section>

      {later.map((group) => (
        <section
          key={group.id}
          aria-labelledby={`group-${group.id}`}
          className="mt-14"
        >
          <h2
            id={`group-${group.id}`}
            className="mb-5 text-lg font-semibold tracking-tight"
          >
            {group.label}
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((event) => (
              <div key={event.id}>
                <EventCard event={event} />
                <p className="mt-1.5 pl-[65px] text-xs text-muted-foreground">
                  {reasonText(matchedInterests(event, interests))}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {hiddenCount > 0 ? (
        <p className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          We left out {hiddenCount} events that don't match your interests.{" "}
          <Link
            href="/"
            className="font-medium text-foreground underline underline-offset-4"
          >
            See all events
          </Link>
        </p>
      ) : null}
    </main>
  );
}

/** The next matching event, big, with the page's one primary button. */
function UpNext({
  event,
  interests,
}: {
  event: MockEvent;
  interests: string[];
}) {
  const soon = startsIn(event.startsAt);
  const day = isToday(event.startsAt) ? "Today" : event.when.date;

  return (
    <section
      aria-labelledby="up-next-heading"
      className="mt-8 grid items-center gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-10"
    >
      <Link
        href={`/events/${event.id}`}
        tabIndex={-1}
        aria-hidden
        className="group block"
      >
        {event.imageUrl ? (
          <EventFlyer
            src={event.imageUrl}
            sizes="(min-width: 768px) 560px, 100vw"
            loading="eager"
            className="aspect-[5/3] rounded-md ring-1 ring-border transition-shadow group-hover:ring-foreground/25"
          />
        ) : (
          <div className="aspect-[5/3] rounded-md bg-muted" />
        )}
      </Link>
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Up next{soon ? `, starts ${soon}` : ""}
        </p>
        <h2
          id="up-next-heading"
          className="mt-1.5 text-3xl font-semibold tracking-tight text-balance"
        >
          <Link
            href={`/events/${event.id}`}
            className="underline-offset-4 outline-none hover:underline hover:decoration-foreground/30 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            {event.title}
          </Link>
        </h2>
        <p className="mt-2 text-muted-foreground">
          {event.hosts.map((host) => host.name).join(", ")}
        </p>

        <dl className="mt-5 space-y-1 text-[15px]">
          <div className="flex gap-2">
            <dt className="sr-only">When</dt>
            <dd>
              <span className="font-medium">{day}</span>,{" "}
              <span className="tabular-nums">{event.when.time}</span>
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Where</dt>
            <dd>{event.location ?? "Location to be announced"}</dd>
            {event.hasFreeFood ? <FreeFoodIcon /> : null}
          </div>
        </dl>
        <p className="mt-2 text-xs text-muted-foreground">
          {reasonText(matchedInterests(event, interests))}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "lg", className: "px-4" })}
          >
            RSVP on RattlerTracks
            <ExternalLinkIcon data-icon="inline-end" />
          </a>
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <CalendarIcon data-icon="inline-start" />
            Add to calendar
          </a>
        </div>
      </div>
    </section>
  );
}

function TodayEventRow({
  event,
  interests,
}: {
  event: MockEvent;
  interests: string[];
}) {
  return (
    <li className="group relative grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <time
        dateTime={event.startsAt}
        className="pt-px text-sm font-medium tabular-nums"
      >
        {event.start.time}
      </time>
      <div className="min-w-0">
        <h3 className="leading-snug font-semibold tracking-tight">
          <Link
            href={`/events/${event.id}`}
            className="outline-none group-hover:underline group-hover:underline-offset-4 after:absolute after:inset-0 focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {event.location ?? "Location to be announced"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {reasonText(matchedInterests(event, interests))}
        </p>
      </div>
    </li>
  );
}

function TodayActivityRow({ activity }: { activity: QuickActivity }) {
  const { joined, count, toggle } = useJoin(activity);
  return (
    <li className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-x-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]">
      <time
        dateTime={activity.startsAt}
        className="self-start pt-px text-sm font-medium tabular-nums"
      >
        {formatTime(activity.startsAt)}
      </time>
      <div className="min-w-0">
        <h3 className="leading-snug font-semibold tracking-tight">
          {activity.title}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {activity.location}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Quick activity from {activity.postedBy}, <GoingCount count={count} />
        </p>
      </div>
      <JoinButton joined={joined} onToggle={toggle} title={activity.title} />
    </li>
  );
}
