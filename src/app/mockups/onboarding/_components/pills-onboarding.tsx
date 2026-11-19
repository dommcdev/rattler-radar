"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { INTEREST_GROUPS } from "../../_lib/data";
import { matchingEvents, type OnboardingEvent, plural } from "./data";
import { BIG_BUTTON, InterestPill, OnboardingDone } from "./shared";

/**
 * Variant A: one calm page. Pills grouped by category, and a sticky footer
 * that always shows what the current picks will do to the home page.
 */
export function PillsOnboarding({ events }: { events: OnboardingEvent[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[] | null>(null);

  const matches = matchingEvents(events, selected);

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

  return (
    // Fills the screen so the footer sits at the bottom even on tall screens.
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <main className="mx-auto w-full flex-1 max-w-2xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
        <h1 className="text-2xl font-semibold tracking-tight">
          What are you into, Maya?
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Pick a few. Your home page will show events tagged with them instead
          of everything on campus. You can change these anytime.
        </p>

        <div className="mt-10 space-y-9">
          {INTEREST_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
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
      </main>

      {/* pb-16 leaves room for the mockup's variant switcher. */}
      <footer className="sticky bottom-0 z-30 border-t bg-background/95 pb-16 backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 pt-3 sm:flex-row sm:items-center sm:px-6">
          <p
            className="text-sm text-muted-foreground sm:flex-1"
            aria-live="polite"
          >
            {selected.length === 0 ? (
              <>
                Nothing picked: you'll see all{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {events.length}
                </span>{" "}
                upcoming events.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground tabular-nums">
                  {matches.length}
                </span>{" "}
                of {plural(events.length, "upcoming event")} match.
              </>
            )}
          </p>
          <div className="flex gap-2">
            {selected.length > 0 ? (
              <Button
                variant="ghost"
                className={`${BIG_BUTTON} flex-1 sm:flex-none`}
                onClick={() => setSaved([])}
              >
                Skip for now
              </Button>
            ) : null}
            <Button
              className={`${BIG_BUTTON} flex-1 sm:flex-none`}
              onClick={() => setSaved(selected)}
            >
              {selected.length === 0
                ? "Continue with all events"
                : `Save ${plural(selected.length, "interest")}`}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
