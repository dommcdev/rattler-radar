"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type MyEvent, shortDate } from "./my-events-data";

/**
 * Confirms cancelling one event, and says exactly what happens. Nothing here
 * messages attendees, so it doesn't claim to; it nudges the leader to tell
 * them instead.
 */
export function CancelEventDialog({
  event,
  onOpenChange,
  onConfirm,
}: {
  /** The event being cancelled; null keeps the dialog closed. */
  event: MyEvent | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (event: MyEvent) => void;
}) {
  // Keep showing the last event while the dialog animates closed.
  const [shown, setShown] = useState(event);
  if (event && event !== shown) setShown(event);

  return (
    <AlertDialog open={event !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-5 p-5 sm:max-w-md">
        {shown ? (
          <>
            <AlertDialogHeader className="gap-2">
              <AlertDialogTitle className="text-base font-semibold tracking-tight">
                Cancel {shown.title}?
              </AlertDialogTitle>
              <AlertDialogDescription
                render={<div />}
                className="space-y-2 text-sm text-pretty"
              >
                <p>
                  It comes off the events feed right away, and its page will say
                  it's cancelled. You can't undo this.
                </p>
                {shown.rsvpCount ? (
                  <p>
                    <span className="font-medium text-foreground tabular-nums">
                      {shown.rsvpCount} students
                    </span>{" "}
                    RSVP'd for {shortDate(shown.startsAt)}. RattlerRadar won't
                    message them, so let them know in your club's group chat.
                  </p>
                ) : null}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel size="lg">Keep event</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                size="lg"
                onClick={() => {
                  onConfirm(shown);
                  onOpenChange(false);
                }}
              >
                Cancel event
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}
