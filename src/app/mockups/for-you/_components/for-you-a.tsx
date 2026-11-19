"use client";

import { PencilIcon, PlusIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EventCard } from "@/components/event-feed/event-card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { interestLabel, type QuickActivity } from "../../_lib/data";
import type { MockEvent } from "../../_lib/get-mock-events";
import {
  formatTime,
  forYouEvents,
  groupByWhen,
  matchedInterests,
  QUICK_ACTIVITIES,
  reasonText,
} from "../_lib/feed";
import { GoingCount, JoinButton, useJoin } from "./join-button";

const ALL = "all";

/**
 * The global feed's layout, narrowed to the student's interests: interest
 * pills as the filter, a strip of quick activities, then cards by when.
 */
export function ForYouA({
  events,
  interests,
}: {
  events: MockEvent[];
  interests: string[];
}) {
  const [filter, setFilter] = useState(ALL);
  const mine = forYouEvents(events, interests);
  const visible =
    filter === ALL ? mine : mine.filter((e) => e.interests.includes(filter));
  const hiddenCount = events.length - mine.length;

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-28 sm:px-6">
      <div className="mb-10 space-y-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">For you</h1>
          <span
            className="text-sm text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {visible.length} {visible.length === 1 ? "event" : "events"}
          </span>
          <div className="flex w-full gap-4 text-sm text-muted-foreground sm:ml-auto sm:w-auto">
            <Link
              href="/mockups/settings/a"
              className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground hover:underline"
            >
              <PencilIcon className="size-3.5" />
              Edit interests
            </Link>
            <Link
              href="/"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              See all {events.length} events
            </Link>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ToggleGroup
            variant="outline"
            spacing={1.5}
            value={[filter]}
            onValueChange={([value]) => value && setFilter(value)}
            aria-label="Show events for"
          >
            {[ALL, ...interests].map((id) => (
              <ToggleGroupItem
                key={id}
                value={id}
                className="h-7 rounded-full px-3 text-xs text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground"
              >
                {id === ALL ? "All my interests" : interestLabel(id)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <QuickActivityStrip activities={QUICK_ACTIVITIES} />

      {visible.length === 0 ? (
        <Empty className="mt-12 border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>
              Nothing coming up for {interestLabel(filter)}
            </EmptyTitle>
            <EmptyDescription>
              New events sync from RattlerTracks every morning.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => setFilter(ALL)}>
              Show all my interests
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-12 space-y-14">
          {groupByWhen(visible).map((group, groupIndex) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
                className="mb-5 text-lg font-semibold tracking-tight"
              >
                {group.label}
              </h2>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {group.items.map((event, index) => (
                  <div key={event.id}>
                    <EventCard
                      event={event}
                      loading={groupIndex === 0 && index < 4 ? "eager" : "lazy"}
                    />
                    {/* Lines up with the title, past the date stamp. */}
                    <p className="mt-1.5 pl-[65px] text-xs text-muted-foreground">
                      {reasonText(matchedInterests(event, interests))}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {hiddenCount > 0 ? (
        <p className="mt-16 border-t pt-6 text-sm text-muted-foreground">
          {hiddenCount} more{" "}
          {hiddenCount === 1 ? "event doesn't" : "events don't"} match your
          interests.{" "}
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

/** One bordered row of today's student-posted activities. */
function QuickActivityStrip({ activities }: { activities: QuickActivity[] }) {
  return (
    <section aria-labelledby="quick-heading">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2
            id="quick-heading"
            className="text-base font-semibold tracking-tight"
          >
            Quick activities
          </h2>
          <p className="text-sm text-muted-foreground">
            Posted by students for today
          </p>
        </div>
        <Link
          href="/mockups/create-event/a"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <PlusIcon data-icon="inline-start" />
          <span className="sm:hidden">Post</span>
          <span className="hidden sm:inline">Post an activity</span>
        </Link>
      </div>
      <div className="-mx-4 flex snap-x scroll-px-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex min-w-full divide-x rounded-lg border">
          {activities.map((activity) => (
            <QuickActivityItem key={activity.id} activity={activity} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function QuickActivityItem({ activity }: { activity: QuickActivity }) {
  const { joined, count, toggle } = useJoin(activity);
  return (
    <li className="flex w-[16rem] shrink-0 snap-start items-center gap-3 p-4 sm:w-auto sm:flex-1">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-snug font-medium">
          {activity.title}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {formatTime(activity.startsAt)} · {activity.location}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <GoingCount count={count} />
        </p>
      </div>
      <JoinButton joined={joined} onToggle={toggle} title={activity.title} />
    </li>
  );
}
