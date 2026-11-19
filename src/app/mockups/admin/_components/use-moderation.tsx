"use client";

import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MOCK_ADMIN, REPORT_REASON_LABELS } from "../../_lib/data";
import type { AdminData, Listing, RemovedListing } from "./types";

type Notice =
  | { kind: "removed"; listing: Listing }
  | { kind: "dismissed"; listing: Listing }
  | { kind: "restored"; listing: Listing };

const NOTICE_MS = 8000;

/** Most reports first, then the most recently reported. */
function byUrgency(a: Listing, b: Listing): number {
  if (a.reports.length !== b.reports.length) {
    return b.reports.length - a.reports.length;
  }
  return latestReport(b) - latestReport(a);
}

function latestReport(listing: Listing): number {
  return Math.max(...listing.reports.map((r) => Date.parse(r.reportedAt)));
}

/**
 * The admin's in-memory moderation state for a mockup: what's been removed,
 * which reports were dismissed, and the last action (for Undo). Nothing
 * persists.
 */
export function useModeration(data: AdminData) {
  const [removed, setRemoved] = useState<RemovedListing[]>(data.removed);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const removedIds = new Set(removed.map((entry) => entry.listing.id));
  const live = data.listings.filter((listing) => !removedIds.has(listing.id));
  const needsReview = live
    .filter(
      (listing) =>
        listing.reports.length > 0 && !dismissedIds.includes(listing.id),
    )
    .toSorted(byUrgency);

  function remove(listing: Listing) {
    const reason = listing.reports[0]
      ? REPORT_REASON_LABELS[listing.reports[0].reason]
      : "Removed by an admin";
    setRemoved((current) => [
      {
        listing,
        removedAt: new Date().toISOString(),
        removedBy: MOCK_ADMIN.name,
        reason,
      },
      ...current,
    ]);
    setNotice({ kind: "removed", listing });
  }

  function restore(listing: Listing, { quiet = false } = {}) {
    setRemoved((current) =>
      current.filter((entry) => entry.listing.id !== listing.id),
    );
    setNotice(quiet ? null : { kind: "restored", listing });
  }

  function dismiss(listing: Listing) {
    setDismissedIds((current) => [...current, listing.id]);
    setNotice({ kind: "dismissed", listing });
  }

  function undismiss(listing: Listing) {
    setDismissedIds((current) => current.filter((id) => id !== listing.id));
    setNotice(null);
  }

  function undo() {
    if (!notice) return;
    if (notice.kind === "removed") restore(notice.listing, { quiet: true });
    if (notice.kind === "dismissed") {
      setDismissedIds((current) =>
        current.filter((id) => id !== notice.listing.id),
      );
      setNotice(null);
    }
  }

  return {
    live,
    needsReview,
    removed,
    notice,
    actions: {
      remove,
      undismiss,
      restore,
      dismiss,
      undo,
      clearNotice: () => setNotice(null),
    },
  };
}

export type Moderation = ReturnType<typeof useModeration>;

/**
 * A small toast above the variant switcher confirming the last action, with
 * Undo for removals and dismissals. Hides itself after a few seconds.
 */
export function ActionNotice({ moderation }: { moderation: Moderation }) {
  const { notice, actions } = moderation;

  const text = !notice
    ? null
    : notice.kind === "removed"
      ? "Listing removed"
      : notice.kind === "dismissed"
        ? notice.listing.reports.length > 1
          ? "Reports dismissed"
          : "Report dismissed"
        : "Listing restored";
  const detail = !notice
    ? null
    : notice.kind === "removed"
      ? notice.listing.kind === "rattlertracks"
        ? "Hidden from the feed and search. The next sync won't bring it back."
        : "Hidden from the feed and search."
      : notice.kind === "dismissed"
        ? "The listing stays in the feed."
        : "It's back in the feed and search.";

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-18 z-50 flex justify-center px-4"
    >
      {notice ? (
        <div
          key={`${notice.kind}-${notice.listing.id}`}
          className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border bg-popover py-2.5 pr-2 pl-4 text-sm text-popover-foreground shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
        >
          <div className="min-w-0 flex-1 py-0.5">
            <p className="font-medium">{text}</p>
            <p className="truncate text-[13px]">{notice.listing.title}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{detail}</p>
          </div>
          {notice.kind !== "restored" ? (
            <Button
              variant="outline"
              size="lg"
              className="h-8 px-3 text-sm"
              onClick={actions.undo}
            >
              Undo
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={actions.clearNotice}
            aria-label="Close"
          >
            <XIcon />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
