"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { FreeFoodIcon } from "@/components/event-feed/free-food-badge";
import { buttonVariants } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { interestLabel, type QuickActivity } from "../../_lib/data";
import type { MockEvent } from "../../_lib/get-mock-events";
import {
  formatTime,
  forYouEvents,
  groupByDay,
  matchedInterests,
  QUICK_ACTIVITIES,
  reasonText,
} from "../_lib/feed";
import { GoingCount, JoinButton, useJoin } from "./join-button";

/**
 * An agenda: matching events listed by day with the time down the left, and
 * a narrow column with the interests driving it and today's quick activities.
 * Turning interests off previews the feed; with none on, it's everything.
 */
export function ForYouB({
  events,
  interests,
}: {
  events: MockEvent[];
  interests: string[];
}) {
  const [active, setActive] = useState(interests);
  const visible = forYouEvents(events, active);
  const days = groupByDay(visible);

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-8 pb-28 sm:px-6">
      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="lg:col-start-1 lg:row-start-1">
          <h1 className="text-2xl font-semibold tracking-tight">For you</h1>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {active.length === 0
              ? `No interests on, so this is every upcoming event (${visible.length}).`
              : `${visible.length} upcoming ${visible.length === 1 ? "event matches" : "events match"} your interests, soonest first.`}
          </p>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-22 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <InterestsPanel
            interests={interests}
            active={active}
            onChange={setActive}
          />
          <div className="hidden lg:block">
            <QuickActivitiesPanel id="quick-aside" />
          </div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <div className="space-y-10">
            {days.map((day, index) => (
              <section key={day.key} aria-labelledby={`day-${day.key}`}>
                <h2
                  id={`day-${day.key}`}
                  className="flex items-baseline gap-2 border-b pb-2"
                >
                  <span className="font-semibold tracking-tight">
                    {day.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {day.date}
                  </span>
                </h2>
                <ul className="divide-y">
                  {day.items.map((event) => (
                    <AgendaRow
                      key={event.id}
                      event={event}
                      reasons={matchedInterests(event, active)}
                    />
                  ))}
                </ul>
                {/* On phones, today's quick activities follow today's events. */}
                {index === 0 ? (
                  <div className="mt-10 lg:hidden">
                    <QuickActivitiesPanel id="quick-inline" />
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm text-muted-foreground">
            Looking for something else?{" "}
            <Link
              href="/"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Browse all {events.length} events
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function AgendaRow({
  event,
  reasons,
}: {
  event: MockEvent;
  reasons: string[];
}) {
  return (
    <li className="group relative grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-x-4 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]">
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
            className="outline-none group-hover:underline group-hover:decoration-foreground/30 group-hover:underline-offset-4 after:absolute after:-inset-x-2 after:inset-y-1 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {event.title}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="truncate">
            {event.location ?? "Location to be announced"}
          </span>
          {event.hasFreeFood ? <FreeFoodIcon /> : null}
        </p>
        {reasons.length > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {reasonText(reasons)}
          </p>
        ) : null}
      </div>
      {event.imageUrl ? (
        <EventFlyer
          src={event.imageUrl}
          sizes="128px"
          className="aspect-[5/3] w-20 rounded-md ring-1 ring-border transition-shadow group-hover:ring-foreground/25 sm:w-32"
        />
      ) : (
        <div className="aspect-[5/3] w-20 rounded-md bg-muted sm:w-32" />
      )}
    </li>
  );
}

function InterestsPanel({
  interests,
  active,
  onChange,
}: {
  interests: string[];
  active: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <section aria-labelledby="interests-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="interests-heading" className="font-semibold tracking-tight">
          Your interests
        </h2>
        <Link
          href="/mockups/settings/a"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Edit
        </Link>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {interests.map((id) => {
          const on = active.includes(id);
          return (
            <Toggle
              key={id}
              variant="outline"
              pressed={on}
              onPressedChange={(pressed) =>
                onChange(
                  pressed
                    ? interests.filter((i) => i === id || active.includes(i))
                    : active.filter((i) => i !== id),
                )
              }
              className={cn(
                "h-7 rounded-full px-3 text-xs text-muted-foreground line-through decoration-muted-foreground/50 aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground aria-pressed:no-underline",
              )}
            >
              {interestLabel(id)}
            </Toggle>
          );
        })}
      </div>
      <p className="mt-2.5 text-xs text-muted-foreground">
        Tap to hide one for now. Edit to change them for good.
      </p>
    </section>
  );
}

function QuickActivitiesPanel({ id }: { id: string }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-semibold tracking-tight">
        Quick activities today
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Posted by students looking for company.
      </p>
      <ul className="mt-2 divide-y">
        {QUICK_ACTIVITIES.map((activity) => (
          <QuickActivityRow key={activity.id} activity={activity} />
        ))}
      </ul>
      <Link
        href="/mockups/create-event/a"
        className={buttonVariants({
          variant: "outline",
          size: "lg",
          className: "mt-3 w-full",
        })}
      >
        <PlusIcon data-icon="inline-start" />
        Post an activity
      </Link>
    </section>
  );
}

function QuickActivityRow({ activity }: { activity: QuickActivity }) {
  const { joined, count, toggle } = useJoin(activity);
  return (
    <li className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug font-medium">{activity.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {formatTime(activity.startsAt)}, {activity.location}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <GoingCount count={count} />
        </p>
      </div>
      <JoinButton joined={joined} onToggle={toggle} title={activity.title} />
    </li>
  );
}
