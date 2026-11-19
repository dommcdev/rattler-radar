"use client";

import { CheckIcon, CircleCheckIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { listLabels, type OnboardingEvent, plural } from "./data";

/** Bigger buttons than the app default, for thumbs. */
export const BIG_BUTTON = "h-10 px-4 text-sm sm:h-9";

/**
 * An interest as a pill toggle. Selected pills invert (solid foreground), so
 * the picked set reads at a glance without spending the navy primary.
 */
export function InterestPill({
  label,
  pressed,
  onPressedChange,
  className,
}: {
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  className?: string;
}) {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        "h-10 gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted sm:h-9",
        "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/85 aria-pressed:hover:text-background",
        className,
      )}
    >
      {pressed ? (
        <CheckIcon className="-ml-1 size-4" />
      ) : (
        <PlusIcon className="-ml-1 size-4 text-muted-foreground" />
      )}
      {label}
    </Toggle>
  );
}

/** Month over day, like the feed card's date stamp. */
export function DateStamp({ event }: { event: OnboardingEvent }) {
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

/**
 * What the student sees after finishing (or skipping). Stands in for the
 * redirect to their home page, and spells out the result so both the normal
 * and the no-interests case can be judged.
 */
export function OnboardingDone({
  interests,
  matchCount,
  totalCount,
  notifications,
  onStartOver,
}: {
  interests: string[];
  matchCount: number;
  totalCount: number;
  notifications?: { email: boolean; push: boolean };
  onStartOver: () => void;
}) {
  const alerts = notifications
    ? [notifications.email && "email", notifications.push && "push"].filter(
        Boolean,
      )
    : [];

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-20 pb-28 text-center sm:px-6">
      <CircleCheckIcon className="size-8 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        You're all set
      </h1>
      {interests.length > 0 ? (
        <p className="mt-2 text-muted-foreground">
          Your home page now shows the{" "}
          <span className="font-medium text-foreground tabular-nums">
            {plural(matchCount, "upcoming event")}
          </span>{" "}
          tagged {listLabels(interests)}.
        </p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          No interests saved, so your home page shows all{" "}
          <span className="font-medium text-foreground tabular-nums">
            {plural(totalCount, "upcoming event")}
          </span>
          .
        </p>
      )}
      {notifications ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {alerts.length > 0
            ? `We'll send ${alerts.join(" and ")} alerts when new events match.`
            : "Notifications are off."}
        </p>
      ) : null}
      <p className="mt-2 text-sm text-muted-foreground">
        Change this anytime in Settings.
      </p>
      <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row-reverse">
        <Link href="/" className={cn(buttonVariants(), BIG_BUTTON)}>
          Go to my events
        </Link>
        <Button variant="ghost" className={BIG_BUTTON} onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </main>
  );
}
