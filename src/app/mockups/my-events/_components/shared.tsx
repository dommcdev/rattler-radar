"use client";

import { cn } from "cn";
import { CalendarPlusIcon, ExternalLinkIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { formatDateParts } from "@/lib/events/format";
import { CREATE_EVENT_HREF, type MyEvent } from "./my-events-data";

/** The screen's one primary action. */
export function CreateEventLink({
  className,
  variant = "default",
}: {
  className?: string;
  /** "outline" when another Create event button is already on screen. */
  variant?: "default" | "outline";
}) {
  return (
    <Link
      href={CREATE_EVENT_HREF}
      className={buttonVariants({ size: "lg", variant, className })}
    >
      <PlusIcon data-icon="inline-start" />
      Create event
    </Link>
  );
}

/** Month over day, like the feed card's stamp. */
export function DateStamp({
  iso,
  muted,
  className,
}: {
  iso: string;
  muted?: boolean;
  className?: string;
}) {
  const { month, day } = formatDateParts(iso);
  return (
    <time
      dateTime={iso}
      className={cn(
        "flex w-9 shrink-0 flex-col items-center",
        muted && "opacity-60",
        className,
      )}
    >
      <span className="text-[11px] font-medium text-muted-foreground">
        {month}
      </span>
      <span className="text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {day}
      </span>
    </time>
  );
}

/** A tear-off calendar page, like the event page's details card. */
export function CalendarTile({ iso }: { iso: string }) {
  const { month, day } = formatDateParts(iso);
  return (
    <time
      dateTime={iso}
      className="flex w-14 shrink-0 flex-col overflow-hidden rounded-md border text-center"
    >
      <span className="bg-muted py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {month}
      </span>
      <span className="py-1.5 text-2xl leading-none font-semibold tabular-nums">
        {day}
      </span>
    </time>
  );
}

/** Synced events are edited on RattlerTracks; the daily sync would undo edits here. */
export function RattlerTracksLink({
  event,
  className,
  label = "Edit on RattlerTracks",
}: {
  event: MyEvent;
  className?: string;
  label?: string;
}) {
  if (!event.rattlerTracksUrl) return null;
  return (
    <a
      href={event.rattlerTracksUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
      <ExternalLinkIcon data-icon="inline-end" />
    </a>
  );
}

export const SYNCED_EXPLANATION =
  "This event comes from RattlerTracks. Change it there; edits made here would be overwritten by the next daily sync.";

/**
 * For a leader who hasn't published anything yet. When the page has no
 * events at all, the header hides its button and this one is the primary.
 */
export function NoEventsEmpty({
  title = "You haven't created any events yet",
  description = "Events you create for Rotaract show up here, so you can update or cancel them later.",
  action = "default",
  className,
}: {
  title?: string;
  description?: string;
  action?: "default" | "outline";
  className?: string;
}) {
  return (
    <Empty className={cn("border py-14", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarPlusIcon />
        </EmptyMedia>
        <EmptyTitle className="text-base font-semibold">{title}</EmptyTitle>
        <EmptyDescription className="text-sm">{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateEventLink variant={action} />
      </EmptyContent>
    </Empty>
  );
}

/** Polite status line after saving or cancelling (stands in for a toast). */
export function Notice({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  return (
    <div aria-live="polite" className="empty:hidden">
      {message ? (
        <p className="flex items-start justify-between gap-3 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
          <span>{message}</span>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            Dismiss
          </button>
        </p>
      ) : null}
    </div>
  );
}

/** Not part of the design: flips the page to a leader with no events. */
export function MockEmptyToggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="mt-16 flex justify-center">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Switch renders the control */}
      <label className="inline-flex items-center gap-2.5 rounded-full border border-dashed px-4 py-2 text-xs text-muted-foreground">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
        Mockup: preview with no events
      </label>
    </div>
  );
}
