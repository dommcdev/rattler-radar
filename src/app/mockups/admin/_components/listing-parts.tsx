"use client";

import {
  CheckIcon,
  MapPinIcon,
  RotateCcwIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { type ReactElement, useState } from "react";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { FreeFoodIcon } from "@/components/event-feed/free-food-badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CAMPUS_TIME_ZONE, formatDateTime } from "@/lib/events/format";
import { cn } from "@/lib/utils";
import {
  type EventReport,
  MOCK_SYNC_RUNS,
  REPORT_REASON_LABELS,
} from "../../_lib/data";
import { KIND_LABELS, type Listing } from "./types";

/** Review buttons: a bit larger than the default, for confident clicks. */
export const ACTION = "h-9 px-3 text-sm";

const shortFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** "Nov 12, 1:42 PM", in campus time. */
export function formatShort(iso: string): string {
  return shortFormat.format(new Date(iso));
}

/** Month over day, like the feed's event cards. */
export function DateStamp({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  return (
    <time
      dateTime={listing.startsAt}
      className={cn("flex w-9 shrink-0 flex-col items-center", className)}
    >
      <span className="text-[11px] font-medium text-muted-foreground">
        {listing.start.month}
      </span>
      <span className="text-xl leading-none font-semibold tracking-tight tabular-nums">
        {listing.start.day}
      </span>
    </time>
  );
}

/** "Wrong details", or "Spam and Duplicate" when reasons differ. */
export function reasonsText(reports: EventReport[]): string {
  const reasons = [
    ...new Set(reports.map((r) => REPORT_REASON_LABELS[r.reason])),
  ];
  return reasons.join(" and ");
}

export function reportCountText(count: number): string {
  return `${count} ${count === 1 ? "report" : "reports"}`;
}

/** What students said, newest first, one per row. */
export function ReportList({
  reports,
  className,
}: {
  reports: EventReport[];
  className?: string;
}) {
  const sorted = reports.toSorted(
    (a, b) => Date.parse(b.reportedAt) - Date.parse(a.reportedAt),
  );
  return (
    <ul className={cn("divide-y", className)}>
      {sorted.map((report) => (
        <li key={`${report.reportedBy}-${report.reportedAt}`} className="py-3">
          <p className="text-[15px] leading-snug">“{report.note}”</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {report.reportedBy}, {formatShort(report.reportedAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * Flyer (if any), when and where, who posted it, and the description.
 * `side` puts a small flyer beside the text on wide screens, so a reviewer
 * sees the words without scrolling past a big image.
 */
export function ListingBody({
  listing,
  side = false,
}: {
  listing: Listing;
  side?: boolean;
}) {
  const flyer = listing.imageUrl ? (
    <EventFlyer
      src={listing.imageUrl}
      sizes={
        side
          ? "(min-width: 768px) 280px, 100vw"
          : "(min-width: 640px) 560px, 100vw"
      }
      loading="eager"
      className="aspect-[5/3] rounded-md ring-1 ring-border"
    />
  ) : null;

  return (
    <div
      className={cn(
        "grid gap-5",
        side && flyer && "md:grid-cols-[1fr_280px] md:items-start md:gap-8",
      )}
    >
      <div className={cn(side && "md:order-last")}>{flyer}</div>
      <div className="min-w-0 space-y-5">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">When</dt>
          <dd>
            {listing.when.date}, {listing.when.time}
          </dd>
          <dt className="text-muted-foreground">Where</dt>
          <dd className="flex items-center gap-1.5">
            {listing.location ?? "Location to be announced"}
            {listing.hasFreeFood ? <FreeFoodIcon /> : null}
          </dd>
          <dt className="text-muted-foreground">
            {listing.kind === "quick" ? "Posted by" : "Hosted by"}
          </dt>
          <dd>{listing.postedBy}</dd>
          <dt className="text-muted-foreground">Source</dt>
          <dd>{sourceText(listing)}</dd>
        </dl>

        {listing.descriptionHtml ? (
          <div
            className="space-y-3 text-[15px] leading-relaxed text-foreground/85 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:text-foreground [&_ul]:list-disc"
            // Sanitized on the server in get-event-feed.ts.
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized HTML
            dangerouslySetInnerHTML={{ __html: listing.descriptionHtml }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No description.</p>
        )}
      </div>
    </div>
  );
}

function sourceText(listing: Listing): string {
  if (listing.kind === "rattlertracks") return "Synced from RattlerTracks";
  if (listing.kind === "club") return "Published here by a club leader";
  return "Quick activity posted by a student";
}

export function KindLabel({ listing }: { listing: Listing }) {
  return <>{KIND_LABELS[listing.kind]}</>;
}

/** What removing does, worded for where the listing came from. */
function removalExplanation(listing: Listing): string {
  if (listing.kind === "rattlertracks") {
    return "Students won't see it in the feed or search. It stays on RattlerTracks, but the daily sync won't republish it here. You can restore it from Removed listings.";
  }
  if (listing.kind === "club") {
    return `Students won't see it in the feed or search, and ${listing.postedBy} can't republish it. You can restore it from Removed listings.`;
  }
  return `Students won't see it in the feed or search, and ${listing.postedBy} can't join it again. You can restore it from Removed listings.`;
}

/**
 * The only red in the admin area: a confirmation before a listing is
 * removed. `trigger` is the button that opens it.
 */
export function RemoveListingDialog({
  listing,
  onRemove,
  trigger,
}: {
  listing: Listing;
  onRemove: () => void;
  trigger: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold tracking-tight">
            Remove “{listing.title}”?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm/relaxed">
            {removalExplanation(listing)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="lg" className={ACTION}>
            Keep listing
          </AlertDialogCancel>
          <Button
            size="lg"
            className="h-9 bg-destructive px-3 text-sm text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
          >
            <Trash2Icon data-icon="inline-start" />
            Remove listing
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * The two decisions for a reported listing, side by side with plain labels:
 * keep it (dismiss the reports) or take it down (remove the listing).
 */
export function ReviewActions({
  listing,
  onDismiss,
  onRemove,
  className,
}: {
  listing: Listing;
  onDismiss: () => void;
  onRemove: () => void;
  className?: string;
}) {
  const many = listing.reports.length > 1;
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        variant="outline"
        size="lg"
        className={ACTION}
        onClick={onDismiss}
      >
        <CheckIcon data-icon="inline-start" />
        {many ? "Dismiss reports" : "Dismiss report"}
      </Button>
      <RemoveListingDialog
        listing={listing}
        onRemove={onRemove}
        trigger={
          <Button variant="outline" size="lg" className={ACTION}>
            <Trash2Icon data-icon="inline-start" />
            Remove listing
          </Button>
        }
      />
    </div>
  );
}

export function RestoreButton({ onRestore }: { onRestore: () => void }) {
  return (
    <Button variant="outline" size="lg" className={ACTION} onClick={onRestore}>
      <RotateCcwIcon data-icon="inline-start" />
      Restore
    </Button>
  );
}

/**
 * One quiet line about the daily RattlerTracks sync. A failed run this week
 * shows up as a link that opens the run history.
 */
export function SyncStatus({ className }: { className?: string }) {
  const [latest] = MOCK_SYNC_RUNS;
  const failed = MOCK_SYNC_RUNS.filter((run) => !run.ok).length;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>
        RattlerTracks synced {formatDateTime(latest.at)}
        {latest.ok ? "" : " (failed)"}
      </span>
      <Popover>
        <PopoverTrigger
          className={cn(
            "inline-flex items-center gap-1 rounded-sm underline decoration-foreground/30 underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
            failed > 0 && "text-destructive hover:text-destructive",
          )}
        >
          {failed > 0 ? (
            <>
              <TriangleAlertIcon className="size-3.5" />
              {failed} failed this week
            </>
          ) : (
            "Sync history"
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 gap-0 p-0 text-sm">
          <p className="border-b px-3 py-2.5 font-medium">Last 4 syncs</p>
          <ul className="divide-y">
            {MOCK_SYNC_RUNS.map((run) => (
              <li key={run.at} className="px-3 py-2.5">
                <p className="flex items-center justify-between gap-2">
                  <span className="font-medium">{formatDateTime(run.at)}</span>
                  {run.ok ? (
                    <span className="text-muted-foreground">Done</span>
                  ) : (
                    <span className="text-destructive">Failed</span>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">
                  {run.ok
                    ? `${run.added} added, ${run.updated} updated${run.kept ? `, ${run.kept} removed listing kept hidden` : ""}`
                    : "RattlerTracks didn't respond. The next run caught up."}
                </p>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}

/** Where a listing is, for the details pane: a quiet location line. */
export function WhereLine({ listing }: { listing: Listing }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <MapPinIcon className="size-3.5 shrink-0" />
      <span className="truncate">
        {listing.location ?? "Location to be announced"}
      </span>
    </span>
  );
}
