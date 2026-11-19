"use client";

import {
  CalendarXIcon,
  ExternalLinkIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCwIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CancelEventDialog } from "./cancel-event-dialog";
import { EditEventForm } from "./edit-event-form";
import { dayAndTime, type MyEvent } from "./my-events-data";
import {
  CreateEventLink,
  DateStamp,
  MockEmptyToggle,
  NoEventsEmpty,
  Notice,
} from "./shared";
import { useMyEvents } from "./use-my-events";

type Tab = "upcoming" | "past" | "cancelled";

const RSVP_WORD: Record<Tab, string> = {
  upcoming: "going",
  past: "went",
  cancelled: "had RSVP'd",
};

const MENU_ITEM = "min-h-8 gap-2.5 px-2.5 text-sm";

/** A: one list, split into Upcoming / Past / Cancelled tabs. */
export function MyEventsA() {
  const state = useMyEvents();
  const { groups } = state;
  const [tab, setTab] = useState<Tab>("upcoming");
  const [editing, setEditing] = useState<MyEvent | null>(null);
  const [cancelling, setCancelling] = useState<MyEvent | null>(null);

  const tabs: { id: Tab; label: string; events: MyEvent[] }[] = [
    { id: "upcoming", label: "Upcoming", events: groups.upcoming },
    { id: "past", label: "Past", events: groups.past },
    { id: "cancelled", label: "Cancelled", events: groups.cancelled },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What you've published for Rotaract.
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
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          className="mt-6 gap-0"
        >
          <TabsList variant="line" className="h-auto gap-4 p-0">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="h-9 flex-none px-0.5 text-sm"
              >
                {item.label}
                <span className="text-muted-foreground tabular-nums">
                  {item.events.length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((item) => (
            <TabsContent
              key={item.id}
              value={item.id}
              className="border-t pt-1 text-sm"
            >
              {item.events.length === 0 ? (
                <TabEmpty tab={item.id} />
              ) : (
                <ul className="divide-y">
                  {item.events.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      tab={item.id}
                      onEdit={() => setEditing(event)}
                      onCancel={() => setCancelling(event)}
                    />
                  ))}
                </ul>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] gap-5 overflow-y-auto p-5 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold tracking-tight">
              Edit event
            </DialogTitle>
            <DialogDescription className="text-sm">
              Changes show up on the feed as soon as you save.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <EditEventForm
              key={editing.id}
              event={editing}
              onDiscard={() => setEditing(null)}
              onSave={(changes) => {
                state.saveEvent(editing.id, changes);
                setEditing(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <CancelEventDialog
        event={cancelling}
        onOpenChange={(open) => !open && setCancelling(null)}
        onConfirm={(event) => state.cancelEvent(event.id)}
      />

      <MockEmptyToggle checked={state.empty} onCheckedChange={state.setEmpty} />
    </>
  );
}

function EventRow({
  event,
  tab,
  onEdit,
  onCancel,
}: {
  event: MyEvent;
  tab: Tab;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const synced = event.source === "rattlertracks";
  const quiet = tab !== "upcoming";

  return (
    <li className="flex items-center gap-3.5 py-4">
      <DateStamp iso={event.startsAt} muted={quiet} />
      <div className="min-w-0 flex-1 border-l pl-3.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className={
              quiet
                ? "text-[15px] leading-snug font-semibold tracking-tight text-muted-foreground"
                : "text-[15px] leading-snug font-semibold tracking-tight"
            }
          >
            {event.title}
          </h3>
          {tab === "cancelled" ? (
            <Badge variant="outline" className="text-muted-foreground">
              Cancelled
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 flex flex-col text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-1.5">
          <span className="shrink-0">{dayAndTime(event)}</span>
          <span
            aria-hidden
            className="hidden text-muted-foreground/50 sm:inline"
          >
            ·
          </span>
          <span className="truncate">{event.location}</span>
          {event.rsvpCount ? (
            <span className="tabular-nums sm:hidden">
              {event.rsvpCount} {RSVP_WORD[tab]}
            </span>
          ) : null}
        </p>
        {synced ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RefreshCwIcon className="size-3" aria-hidden />
            Synced from RattlerTracks
          </p>
        ) : null}
      </div>

      {event.rsvpCount ? (
        <p className="hidden shrink-0 text-right text-sm text-muted-foreground sm:block">
          <span className="font-medium text-foreground tabular-nums">
            {event.rsvpCount}
          </span>{" "}
          {RSVP_WORD[tab]}
        </p>
      ) : null}

      <RowMenu event={event} tab={tab} onEdit={onEdit} onCancel={onCancel} />
    </li>
  );
}

function RowMenu({
  event,
  tab,
  onEdit,
  onCancel,
}: {
  event: MyEvent;
  tab: Tab;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const synced = event.source === "rattlertracks";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="shrink-0 text-muted-foreground"
          />
        }
      >
        <MoreHorizontalIcon />
        <span className="sr-only">Actions for {event.title}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5">
        {tab === "upcoming" && !synced ? (
          <DropdownMenuItem className={MENU_ITEM} onClick={onEdit}>
            <PencilIcon />
            Edit details
          </DropdownMenuItem>
        ) : null}
        {tab === "upcoming" && synced && event.rattlerTracksUrl ? (
          <DropdownMenuLinkItem
            className={MENU_ITEM}
            render={
              // biome-ignore lint/a11y/useAnchorContent: Base UI fills in the children
              <a
                href={event.rattlerTracksUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon />
            Edit on RattlerTracks
          </DropdownMenuLinkItem>
        ) : null}
        <DropdownMenuLinkItem
          className={MENU_ITEM}
          render={<Link href={synced ? `/events/${event.id}` : "#"} />}
        >
          <EyeIcon />
          View event page
        </DropdownMenuLinkItem>
        {tab === "upcoming" && !synced ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className={MENU_ITEM}
              onClick={onCancel}
            >
              <CalendarXIcon />
              Cancel event
            </DropdownMenuItem>
          </>
        ) : null}
        {tab === "upcoming" && synced ? (
          <>
            <DropdownMenuSeparator />
            <p className="px-2.5 py-1.5 text-xs/relaxed text-pretty text-muted-foreground">
              This one comes from RattlerTracks. Edit or cancel it there, or the
              daily sync will overwrite your changes.
            </p>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TabEmpty({ tab }: { tab: Tab }) {
  if (tab === "upcoming") {
    return (
      <NoEventsEmpty
        action="outline"
        title="Nothing coming up"
        description="Your past and cancelled events are in the other tabs. Plan the next one when you're ready."
        className="mt-6"
      />
    );
  }
  return (
    <Empty className="py-14">
      <EmptyHeader>
        <EmptyTitle className="text-base font-semibold">
          {tab === "past" ? "No past events yet" : "No cancelled events"}
        </EmptyTitle>
        <EmptyDescription className="text-sm">
          {tab === "past"
            ? "Events move here after they happen."
            : "If you cancel an event, it moves here."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
