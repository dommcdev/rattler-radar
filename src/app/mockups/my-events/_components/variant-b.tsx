"use client";

import { cn } from "cn";
import { ChevronRightIcon, RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CancelEventDialog } from "./cancel-event-dialog";
import { EditEventForm } from "./edit-event-form";
import {
  isPast,
  isUpcoming,
  type MyEvent,
  shortDate,
  timeRange,
} from "./my-events-data";
import {
  CreateEventLink,
  MockEmptyToggle,
  NoEventsEmpty,
  Notice,
  RattlerTracksLink,
} from "./shared";
import { useMyEvents } from "./use-my-events";

type Filter = "all" | "upcoming" | "past" | "cancelled";
type Status = Exclude<Filter, "all">;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_LABEL: Record<Status, string> = {
  upcoming: "Upcoming",
  past: "Past",
  cancelled: "Cancelled",
};

const RSVP_WORD: Record<Status, string> = {
  upcoming: "going",
  past: "went",
  cancelled: "had RSVP'd",
};

function statusOf(event: MyEvent): Status {
  if (isUpcoming(event)) return "upcoming";
  if (isPast(event)) return "past";
  return "cancelled";
}

/** Upcoming first (soonest on top), then past and cancelled, newest first. */
function sortForTable(events: MyEvent[]): MyEvent[] {
  const rank = { upcoming: 0, past: 1, cancelled: 1 };
  return [...events].sort((a, b) => {
    const byRank = rank[statusOf(a)] - rank[statusOf(b)];
    if (byRank !== 0) return byRank;
    return statusOf(a) === "upcoming"
      ? a.startsAt.localeCompare(b.startsAt)
      : b.startsAt.localeCompare(a.startsAt);
  });
}

/** B: every event in one scannable table; edits happen in a side sheet. */
export function MyEventsB() {
  const state = useMyEvents();
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<MyEvent | null>(null);
  const [cancelling, setCancelling] = useState<MyEvent | null>(null);

  const rows = sortForTable(
    state.events.filter(
      (event) => filter === "all" || statusOf(event) === filter,
    ),
  );
  const count = (id: Filter) =>
    id === "all"
      ? state.events.length
      : state.events.filter((event) => statusOf(event) === id).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">My events</h1>
          <span className="text-sm text-muted-foreground tabular-nums">
            {state.events.length}{" "}
            {state.events.length === 1 ? "event" : "events"}
          </span>
        </div>
        {state.events.length > 0 ? <CreateEventLink /> : null}
      </div>

      {state.events.length === 0 ? (
        <NoEventsEmpty className="mt-8" />
      ) : (
        <>
          <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ToggleGroup
              variant="outline"
              spacing={1.5}
              value={[filter]}
              onValueChange={([value]) => value && setFilter(value as Filter)}
              aria-label="Show events"
            >
              {FILTERS.map((item) => (
                <ToggleGroupItem
                  key={item.id}
                  value={item.id}
                  className="h-7 gap-1.5 rounded-full px-3 text-xs text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground"
                >
                  {item.label}
                  <span className="tabular-nums opacity-70">
                    {count(item.id)}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="mt-4">
            <Notice message={state.notice} onDismiss={state.clearNotice} />
          </div>

          {rows.length === 0 ? (
            <Empty className="mt-4 border py-14">
              <EmptyHeader>
                <EmptyTitle className="text-base font-semibold">
                  No {filter} events
                </EmptyTitle>
                <EmptyDescription className="text-sm">
                  {filter === "upcoming"
                    ? "Create one and it'll show up here and on the feed."
                    : "Nothing here right now."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <EventsTable rows={rows} onEdit={setEditing} />
              <EventsList rows={rows} onEdit={setEditing} />
            </>
          )}
        </>
      )}

      <Sheet
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
          <SheetHeader className="border-b p-5 pr-12">
            <SheetTitle className="text-base font-semibold tracking-tight">
              Edit event
            </SheetTitle>
            <SheetDescription className="text-sm">
              Changes show up on the feed as soon as you save.
            </SheetDescription>
          </SheetHeader>
          {editing ? (
            <EditEventForm
              key={editing.id}
              event={editing}
              className="min-h-0 flex-1"
              bodyClassName="flex-1 overflow-y-auto p-5"
              footerClassName="mt-0 border-t p-5"
              footerStart={
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                  onClick={() => setCancelling(editing)}
                >
                  Cancel event
                </Button>
              }
              onDiscard={() => setEditing(null)}
              onSave={(changes) => {
                state.saveEvent(editing.id, changes);
                setEditing(null);
              }}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <CancelEventDialog
        event={cancelling}
        onOpenChange={(open) => !open && setCancelling(null)}
        onConfirm={(event) => {
          state.cancelEvent(event.id);
          setEditing(null);
        }}
      />

      <MockEmptyToggle checked={state.empty} onCheckedChange={state.setEmpty} />
    </>
  );
}

function EventsTable({
  rows,
  onEdit,
}: {
  rows: MyEvent[];
  onEdit: (event: MyEvent) => void;
}) {
  return (
    <div className="mt-4 hidden rounded-lg border md:block">
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4 text-muted-foreground">Event</TableHead>
            <TableHead className="text-muted-foreground">Date</TableHead>
            <TableHead className="text-muted-foreground">Location</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-right text-muted-foreground">
              Going
            </TableHead>
            <TableHead className="pr-4">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((event) => {
            const status = statusOf(event);
            const quiet = status !== "upcoming";
            return (
              <TableRow key={event.id} className="hover:bg-muted/40">
                <TableCell className="max-w-72 py-3 pl-4 whitespace-normal">
                  <p
                    className={cn(
                      "font-medium",
                      quiet && "text-muted-foreground",
                    )}
                  >
                    {event.title}
                  </p>
                  {event.source === "rattlertracks" ? (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <RefreshCwIcon className="size-3" aria-hidden />
                      Synced from RattlerTracks
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="py-3">
                  <p className={cn(quiet && "text-muted-foreground")}>
                    <time dateTime={event.startsAt}>
                      {shortDate(event.startsAt)}
                    </time>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeRange(event.startsAt, event.endsAt)}
                  </p>
                </TableCell>
                <TableCell className="max-w-56 truncate py-3 text-muted-foreground">
                  {event.location}
                </TableCell>
                <TableCell className="py-3">
                  <StatusLabel status={status} />
                </TableCell>
                <TableCell className="py-3 text-right tabular-nums">
                  {event.rsvpCount ?? "–"}
                </TableCell>
                <TableCell className="py-3 pr-4 text-right">
                  <RowAction event={event} status={status} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** Phones get the same rows as a list; the whole row opens the editor. */
function EventsList({
  rows,
  onEdit,
}: {
  rows: MyEvent[];
  onEdit: (event: MyEvent) => void;
}) {
  return (
    <ul className="mt-4 divide-y border-y md:hidden">
      {rows.map((event) => {
        const status = statusOf(event);
        const editable = status === "upcoming" && event.source === "manual";
        const body = (
          <>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium",
                  status !== "upcoming" && "text-muted-foreground",
                )}
              >
                {event.title}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {shortDate(event.startsAt)},{" "}
                {timeRange(event.startsAt, event.endsAt)}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {event.location}
              </p>
              <p className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                <StatusLabel status={status} />
                {event.rsvpCount ? (
                  <span className="tabular-nums">
                    {event.rsvpCount} {RSVP_WORD[status]}
                  </span>
                ) : null}
              </p>
            </div>
          </>
        );
        return (
          <li key={event.id}>
            {editable ? (
              <button
                type="button"
                onClick={() => onEdit(event)}
                className="flex w-full items-center gap-3 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {body}
                <span className="flex shrink-0 items-center gap-0.5 text-sm text-muted-foreground">
                  Edit
                  <ChevronRightIcon className="size-4" aria-hidden />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 py-4">{body}</div>
            )}
            {status === "upcoming" && event.source === "rattlertracks" ? (
              <p className="-mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 pb-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCwIcon className="size-3" aria-hidden />
                  Synced from RattlerTracks, so it's edited there.
                </span>
                <RattlerTracksLink
                  event={event}
                  label="Edit on RattlerTracks"
                  className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4 [&_svg]:size-3"
                />
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function RowAction({
  event,
  status,
  onEdit,
}: {
  event: MyEvent;
  status: Status;
  onEdit: (event: MyEvent) => void;
}) {
  if (status !== "upcoming") return null;
  if (event.source === "rattlertracks") {
    return (
      <RattlerTracksLink
        event={event}
        className={buttonVariants({ variant: "ghost", size: "lg" })}
      />
    );
  }
  return (
    <Button variant="outline" size="lg" onClick={() => onEdit(event)}>
      Edit
      <span className="sr-only"> {event.title}</span>
    </Button>
  );
}

function StatusLabel({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          status === "upcoming" && "bg-foreground",
          status === "past" && "bg-muted-foreground/50",
          status === "cancelled" &&
            "border border-muted-foreground bg-transparent",
        )}
      />
      <span className={cn(status !== "upcoming" && "text-muted-foreground")}>
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}
