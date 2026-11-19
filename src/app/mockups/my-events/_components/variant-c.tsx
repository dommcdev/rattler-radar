"use client";

import { cn } from "cn";
import {
  ChevronDownIcon,
  ClockIcon,
  MapPinIcon,
  RefreshCwIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatWhen } from "@/lib/events/format";
import { CancelEventDialog } from "./cancel-event-dialog";
import { EditEventForm } from "./edit-event-form";
import {
  dayAndTime,
  type MyEvent,
  relativeDay,
  timeRange,
} from "./my-events-data";
import {
  CalendarTile,
  CreateEventLink,
  DateStamp,
  MockEmptyToggle,
  NoEventsEmpty,
  Notice,
  RattlerTracksLink,
  SYNCED_EXPLANATION,
} from "./shared";
import { type EventChanges, useMyEvents } from "./use-my-events";

/** C: the soonest event, big, with everything else in a compact list. */
export function MyEventsC() {
  const state = useMyEvents();
  const { upcoming, past, cancelled } = state.groups;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<MyEvent | null>(null);
  const [showOlder, setShowOlder] = useState(false);

  const [next, ...later] = upcoming;
  const older = [...past, ...cancelled].sort((a, b) =>
    b.startsAt.localeCompare(a.startsAt),
  );

  function save(id: string, changes: EventChanges) {
    state.saveEvent(id, changes);
    setEditingId(null);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {upcoming.length > 0
              ? `${upcoming.length} coming up for Rotaract.`
              : "Events you publish for Rotaract."}
          </p>
        </div>
        {state.events.length > 0 ? <CreateEventLink /> : null}
      </div>

      <div className="mt-6">
        <Notice message={state.notice} onDismiss={state.clearNotice} />
      </div>

      {state.events.length === 0 ? (
        <NoEventsEmpty className="mt-8" />
      ) : (
        <div className="mt-8 space-y-12">
          <section aria-labelledby="next-up">
            <h2
              id="next-up"
              className="text-sm font-medium text-muted-foreground"
            >
              Next up
            </h2>
            {next ? (
              <NextUp
                event={next}
                editing={editingId === next.id}
                onEdit={() => setEditingId(next.id)}
                onDiscard={() => setEditingId(null)}
                onSave={(changes) => save(next.id, changes)}
                onCancel={() => setCancelling(next)}
              />
            ) : (
              <NoEventsEmpty
                action="outline"
                title="Nothing coming up"
                description="Your past and cancelled events are below. Plan the next one when you're ready."
                className="mt-3"
              />
            )}
          </section>

          {later.length > 0 ? (
            <section aria-labelledby="later">
              <h2
                id="later"
                className="text-sm font-medium text-muted-foreground"
              >
                Later
              </h2>
              <ul className="mt-2 divide-y border-y">
                {later.map((event) => (
                  <LaterRow
                    key={event.id}
                    event={event}
                    editing={editingId === event.id}
                    onEdit={() => setEditingId(event.id)}
                    onDiscard={() => setEditingId(null)}
                    onSave={(changes) => save(event.id, changes)}
                    onCancel={() => setCancelling(event)}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {older.length > 0 ? (
            <section>
              <button
                type="button"
                aria-expanded={showOlder}
                onClick={() => setShowOlder((open) => !open)}
                className="flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Past and cancelled
                <span className="tabular-nums">({older.length})</span>
                <ChevronDownIcon
                  aria-hidden
                  className={cn(
                    "size-4 transition-transform motion-reduce:transition-none",
                    showOlder && "rotate-180",
                  )}
                />
              </button>
              {showOlder ? (
                <ul className="mt-2 divide-y border-y">
                  {older.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-center gap-3.5 py-3"
                    >
                      <DateStamp iso={event.startsAt} muted />
                      <div className="min-w-0 flex-1 border-l pl-3.5">
                        <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-muted-foreground">
                          {event.title}
                          {event.status === "cancelled" ? (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              Cancelled
                            </Badge>
                          ) : null}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {event.location}
                        </p>
                      </div>
                      {event.rsvpCount ? (
                        <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
                          {event.rsvpCount}{" "}
                          {event.status === "cancelled" ? "had RSVP'd" : "went"}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}
        </div>
      )}

      <CancelEventDialog
        event={cancelling}
        onOpenChange={(open) => !open && setCancelling(null)}
        onConfirm={(event) => {
          state.cancelEvent(event.id);
          setEditingId(null);
        }}
      />

      <MockEmptyToggle checked={state.empty} onCheckedChange={state.setEmpty} />
    </>
  );
}

interface EditableProps {
  event: MyEvent;
  editing: boolean;
  onEdit: () => void;
  onDiscard: () => void;
  onSave: (changes: EventChanges) => void;
  onCancel: () => void;
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
      onClick={onClick}
    >
      Cancel event
    </Button>
  );
}

function NextUp({
  event,
  editing,
  onEdit,
  onDiscard,
  onSave,
  onCancel,
}: EditableProps) {
  const synced = event.source === "rattlertracks";

  if (editing) {
    return (
      <div className="mt-3 rounded-lg border bg-card p-5 sm:p-6">
        <h3 className="mb-5 font-semibold tracking-tight">
          Editing {event.title}
        </h3>
        <EditEventForm
          event={event}
          bodyClassName="max-w-xl"
          footerStart={<CancelButton onClick={onCancel} />}
          onDiscard={onDiscard}
          onSave={onSave}
        />
      </div>
    );
  }

  return (
    <article className="mt-3 rounded-lg border bg-card">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <CalendarTile iso={event.startsAt} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {relativeDay(event.startsAt)}
            </p>
            <h3 className="mt-0.5 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {event.title}
            </h3>
          </div>
        </div>
        {/* Indented to line up with the title (tile width + gap). */}
        <div className="sm:pl-20">
          <dl className="mt-5 space-y-2 text-[15px]">
            <div className="flex gap-2.5">
              <dt className="pt-0.5 text-muted-foreground">
                <ClockIcon className="size-4" />
                <span className="sr-only">When</span>
              </dt>
              <dd>
                {formatWhen(event.startsAt, event.endsAt).date},{" "}
                {timeRange(event.startsAt, event.endsAt)}
              </dd>
            </div>
            <div className="flex gap-2.5">
              <dt className="pt-0.5 text-muted-foreground">
                <MapPinIcon className="size-4" />
                <span className="sr-only">Where</span>
              </dt>
              <dd>{event.location}</dd>
            </div>
            {event.rsvpCount ? (
              <div className="flex gap-2.5">
                <dt className="pt-0.5 text-muted-foreground">
                  <UsersIcon className="size-4" />
                  <span className="sr-only">RSVPs</span>
                </dt>
                <dd>
                  <span className="font-medium tabular-nums">
                    {event.rsvpCount}
                  </span>{" "}
                  <span className="text-muted-foreground">going</span>
                </dd>
              </div>
            ) : null}
          </dl>
          {event.description ? (
            <p className="mt-4 line-clamp-2 max-w-prose text-sm text-muted-foreground">
              {event.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:px-6">
        {synced ? (
          <>
            <p className="flex flex-1 gap-2 text-sm text-muted-foreground">
              <RefreshCwIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {SYNCED_EXPLANATION}
            </p>
            <RattlerTracksLink
              event={event}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "shrink-0",
              })}
            />
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={onEdit}
              >
                Edit details
              </Button>
              <Link
                href="#"
                className={buttonVariants({
                  variant: "ghost",
                  size: "lg",
                  className: "flex-1 sm:flex-none",
                })}
              >
                View event page
              </Link>
            </div>
            <div className="sm:ml-auto">
              <CancelButton onClick={onCancel} />
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function LaterRow({
  event,
  editing,
  onEdit,
  onDiscard,
  onSave,
  onCancel,
}: EditableProps) {
  const synced = event.source === "rattlertracks";

  return (
    <li className="py-3.5">
      <div className="flex items-center gap-3.5">
        <DateStamp iso={event.startsAt} />
        <div className="min-w-0 flex-1 border-l pl-3.5">
          <h3 className="text-[15px] leading-snug font-semibold tracking-tight">
            {event.title}
          </h3>
          <p className="mt-0.5 flex flex-col text-sm text-muted-foreground sm:flex-row sm:gap-1.5">
            <span className="shrink-0">{dayAndTime(event)}</span>
            <span
              aria-hidden
              className="hidden text-muted-foreground/50 sm:inline"
            >
              ·
            </span>
            <span className="truncate">{event.location}</span>
          </p>
        </div>
        {event.rsvpCount ? (
          <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
            <span className="font-medium text-foreground tabular-nums">
              {event.rsvpCount}
            </span>{" "}
            going
          </p>
        ) : null}
        {synced ? (
          <RattlerTracksLink
            event={event}
            label="Edit on RattlerTracks"
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          />
        ) : editing ? null : (
          <Button variant="outline" size="lg" onClick={onEdit}>
            Edit
            <span className="sr-only"> {event.title}</span>
          </Button>
        )}
      </div>
      {editing ? (
        <div className="mt-4 mb-1 rounded-lg border bg-card p-5">
          <EditEventForm
            event={event}
            bodyClassName="max-w-xl"
            footerStart={<CancelButton onClick={onCancel} />}
            onDiscard={onDiscard}
            onSave={onSave}
          />
        </div>
      ) : null}
    </li>
  );
}
