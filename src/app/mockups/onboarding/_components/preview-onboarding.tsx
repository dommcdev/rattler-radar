"use client";

import { SearchXIcon } from "lucide-react";
import { useState } from "react";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { FreeFoodIcon } from "@/components/event-feed/free-food-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { INTEREST_GROUPS, interestLabel } from "../../_lib/data";
import {
  listLabels,
  matchingEvents,
  type OnboardingEvent,
  plural,
} from "./data";
import { BIG_BUTTON, DateStamp, InterestPill, OnboardingDone } from "./shared";

/** How many preview rows to show before "and N more". */
const PREVIEW_LIMIT = 6;

/**
 * Variant C: picker on the left, the home page it produces on the right.
 * Every tap visibly reshapes the feed, so the payoff is obvious before
 * saving. On phones the preview stacks under the picker and a sticky bar
 * keeps the count and the save button in reach.
 */
export function PreviewOnboarding({ events }: { events: OnboardingEvent[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[] | null>(null);

  const matches = selected.length ? matchingEvents(events, selected) : events;

  function toggle(id: string, on: boolean) {
    setSelected((current) =>
      on ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  if (saved) {
    return (
      <OnboardingDone
        interests={saved}
        matchCount={matchingEvents(events, saved).length}
        totalCount={events.length}
        onStartOver={() => {
          setSaved(null);
          setSelected([]);
        }}
      />
    );
  }

  const primaryLabel =
    selected.length === 0
      ? "Continue with all events"
      : `Save ${plural(selected.length, "interest")}`;

  const actions = (
    <>
      <Button
        className={`${BIG_BUTTON} flex-1 lg:flex-none`}
        onClick={() => setSaved(selected)}
      >
        {primaryLabel}
      </Button>
      {selected.length > 0 ? (
        <Button
          variant="ghost"
          className={`${BIG_BUTTON} flex-1 lg:flex-none`}
          onClick={() => setSaved([])}
        >
          Skip for now
        </Button>
      ) : null}
    </>
  );

  return (
    <>
      <main className="mx-auto grid w-full max-w-[1100px] gap-x-16 gap-y-12 px-4 pt-10 pb-12 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:pb-28">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Make the home page yours
          </h1>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Pick what you care about and watch the feed change. Only events with
            at least one of your interests will show up. You can change these
            anytime.
          </p>

          <div className="mt-10 space-y-8">
            {INTEREST_GROUPS.map((group) => (
              <section key={group.id} aria-labelledby={`c-${group.id}`}>
                <h2
                  id={`c-${group.id}`}
                  className="text-sm font-medium text-muted-foreground"
                >
                  {group.label}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.interests.map((interest) => (
                    <InterestPill
                      key={interest.id}
                      label={interest.label}
                      pressed={selected.includes(interest.id)}
                      onPressedChange={(on) => toggle(interest.id, on)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 hidden gap-2 lg:flex">{actions}</div>
        </div>

        <section
          aria-labelledby="preview-heading"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="flex items-baseline gap-3 border-b pb-3">
            <h2
              id="preview-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Your home page
            </h2>
            <span
              className="text-sm text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              {selected.length === 0
                ? `All ${events.length} events`
                : `${matches.length} of ${events.length} events`}
            </span>
          </div>

          {selected.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              With nothing picked, you'll see everything on campus. Pick an
              interest to narrow it down.
            </p>
          ) : null}

          {matches.length === 0 ? (
            <Empty className="mt-6 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>
                  Nothing tagged {listLabels(selected)} right now
                </EmptyTitle>
                <EmptyDescription>
                  New ones will show up here as clubs post them. Add another
                  interest to fill your feed in the meantime.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y">
              {matches.slice(0, PREVIEW_LIMIT).map((event) => (
                <PreviewRow key={event.id} event={event} selected={selected} />
              ))}
            </ul>
          )}
          {matches.length > PREVIEW_LIMIT ? (
            <p className="border-t pt-3 text-sm text-muted-foreground">
              and {plural(matches.length - PREVIEW_LIMIT, "more event")}
            </p>
          ) : null}
        </section>
      </main>

      {/* Phones: count and save stay in reach. pb-16 clears the mockup switcher. */}
      <footer className="sticky bottom-0 z-30 border-t bg-background/95 pb-16 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-2 px-4 pt-3 sm:px-6">
          <p className="text-sm text-muted-foreground">
            {selected.length === 0 ? (
              "Nothing picked: you'll see every event."
            ) : (
              <>
                <span className="font-medium text-foreground tabular-nums">
                  {matches.length}
                </span>{" "}
                of {events.length} events match. Preview below.
              </>
            )}
          </p>
          <div className="flex flex-row-reverse gap-2">{actions}</div>
        </div>
      </footer>
    </>
  );
}

function PreviewRow({
  event,
  selected,
}: {
  event: OnboardingEvent;
  selected: string[];
}) {
  const matched = event.interests.filter((id) => selected.includes(id));

  return (
    <li className="flex gap-3.5 py-3.5">
      <DateStamp event={event} />
      <div className="min-w-0 flex-1 border-l pl-3.5">
        <p className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-tight">
          {event.title}
        </p>
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
        {matched.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-1">
            {matched.map((id) => (
              <li
                key={id}
                className="inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-medium"
              >
                {interestLabel(id)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {event.imageUrl ? (
        <EventFlyer
          src={event.imageUrl}
          sizes="96px"
          className="hidden aspect-[5/3] w-24 shrink-0 self-start rounded-md ring-1 ring-border sm:block"
        />
      ) : null}
    </li>
  );
}
