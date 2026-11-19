"use client";

import {
  CheckCircle2Icon,
  ChevronDownIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  DateStamp,
  formatShort,
  ListingBody,
  RemoveListingDialog,
  ReportList,
  RestoreButton,
  ReviewActions,
  reasonsText,
  reportCountText,
  SyncStatus,
} from "./listing-parts";
import { type AdminData, KIND_LABELS, type Listing } from "./types";
import { ActionNotice, useModeration } from "./use-moderation";

const PREVIEW_COUNT = 6;

/**
 * Variant C: one page, top to bottom in order of urgency. Reported items
 * come first with their reports and the two decisions right in the list, so
 * most reviews never leave the page. Then a searchable list of everything,
 * then what's been removed. Results show in place with Undo.
 */
export function AdminOverview({ data }: { data: AdminData }) {
  const moderation = useModeration(data);
  const { live, needsReview, removed, actions } = moderation;

  // Keep reported items in their spot after a decision, so the result
  // (and its Undo) shows where the admin was looking.
  const [reported] = useState(() => needsReview.map((listing) => listing.id));
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const q = query.trim().toLowerCase();
  const matches = live.filter((listing) =>
    `${listing.title} ${listing.postedBy} ${listing.location ?? ""}`
      .toLowerCase()
      .includes(q),
  );
  const visible = showAll || q ? matches : matches.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <SyncStatus />
      </div>

      {/* Needs review */}
      <section aria-labelledby="review-heading" className="mt-10">
        <div className="mb-3 flex items-baseline gap-3">
          <h2
            id="review-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Needs review
          </h2>
          <span
            className="text-sm text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {needsReview.length === 0
              ? "All caught up"
              : `${needsReview.length} reported by students`}
          </span>
        </div>

        <ul className="divide-y rounded-lg border">
          {reported.map((id) => {
            const pending = needsReview.find((l) => l.id === id);
            if (pending) {
              return (
                <ReviewItem
                  key={id}
                  listing={pending}
                  // The result shows in place, so skip the toast.
                  onDismiss={() => {
                    actions.dismiss(pending);
                    actions.clearNotice();
                  }}
                  onRemove={() => {
                    actions.remove(pending);
                    actions.clearNotice();
                  }}
                />
              );
            }
            const removedEntry = removed.find((e) => e.listing.id === id);
            const listing =
              removedEntry?.listing ?? live.find((l) => l.id === id);
            if (!listing) return null;
            return (
              <ResolvedItem
                key={id}
                listing={listing}
                outcome={removedEntry ? "removed" : "dismissed"}
                onUndo={() =>
                  removedEntry
                    ? actions.restore(listing, { quiet: true })
                    : actions.undismiss(listing)
                }
              />
            );
          })}
        </ul>
      </section>

      {/* All listings */}
      <section aria-labelledby="all-heading" className="mt-14">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-3">
          <h2 id="all-heading" className="text-lg font-semibold tracking-tight">
            All listings
          </h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {q ? `${matches.length} of ${live.length}` : live.length}
          </span>
          <InputGroup className="h-8 w-full sm:ml-auto sm:w-72">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, clubs, or places"
              aria-label="Search all listings"
              className="text-sm md:text-sm"
            />
          </InputGroup>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
            No listings match “{query}”.{" "}
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-foreground underline underline-offset-4"
            >
              Clear search
            </button>
          </div>
        ) : (
          <ul className="divide-y rounded-lg border">
            {visible.map((listing) => (
              <ListingItem
                key={listing.id}
                listing={listing}
                onRemove={() => actions.remove(listing)}
              />
            ))}
          </ul>
        )}
        {!q && !showAll && matches.length > PREVIEW_COUNT ? (
          <Button
            variant="ghost"
            size="lg"
            className="mt-2 h-9 px-3 text-sm text-muted-foreground"
            onClick={() => setShowAll(true)}
          >
            <ChevronDownIcon data-icon="inline-start" />
            Show all {matches.length}
          </Button>
        ) : null}
      </section>

      {/* Removed */}
      <section aria-labelledby="removed-heading" className="mt-14">
        <div className="mb-1 flex items-baseline gap-3">
          <h2
            id="removed-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Removed listings
          </h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {removed.length}
          </span>
        </div>
        <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
          Hidden from students. The daily RattlerTracks sync keeps these hidden,
          even if RattlerTracks still lists them.
        </p>
        {removed.length === 0 ? (
          <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing removed.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {removed.map((entry) => (
              <li
                key={entry.listing.id}
                className="flex items-center gap-4 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium tracking-tight">
                    {entry.listing.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.reason}, removed {formatShort(entry.removedAt)} by{" "}
                    {entry.removedBy}
                  </p>
                </div>
                <RestoreButton
                  onRestore={() => actions.restore(entry.listing)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActionNotice moderation={moderation} />
    </>
  );
}

function ReviewItem({
  listing,
  onDismiss,
  onRemove,
}: {
  listing: Listing;
  onDismiss: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `details-${listing.id}`;

  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">
            {listing.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {KIND_LABELS[listing.kind]}, {listing.postedBy}
          </p>
        </div>
        <ReviewActions
          listing={listing}
          onDismiss={onDismiss}
          onRemove={onRemove}
          className="shrink-0"
        />
      </div>

      <div className="mt-3">
        <p className="text-sm font-medium">
          {reasonsText(listing.reports)}
          <span className="font-normal text-muted-foreground">
            , {reportCountText(listing.reports.length)}
          </span>
        </p>
        <ReportList
          reports={listing.reports}
          className="border-l pl-4 [&>li]:py-2"
        />
      </div>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={detailsId}
        onClick={() => setExpanded(!expanded)}
        className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline decoration-foreground/30 underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {expanded ? "Hide listing" : "Show the listing"}
        <ChevronDownIcon
          className={cn(
            "size-3.5 motion-safe:transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded ? (
        <div id={detailsId} className="mt-4 border-t pt-4">
          <ListingBody listing={listing} side />
        </div>
      ) : null}
    </li>
  );
}

function ResolvedItem({
  listing,
  outcome,
  onUndo,
}: {
  listing: Listing;
  outcome: "removed" | "dismissed";
  onUndo: () => void;
}) {
  const many = listing.reports.length > 1;
  return (
    <li
      aria-live="polite"
      className="flex items-center gap-3 bg-muted/40 px-4 py-3 first:rounded-t-lg last:rounded-b-lg sm:px-5"
    >
      {outcome === "removed" ? (
        <Trash2Icon className="size-4 shrink-0 text-muted-foreground" />
      ) : (
        <CheckCircle2Icon className="size-4 shrink-0 text-muted-foreground" />
      )}
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-medium">
          {outcome === "removed"
            ? "Listing removed"
            : many
              ? "Reports dismissed"
              : "Report dismissed"}
        </span>
        <span className="text-muted-foreground">
          {": "}
          {listing.title}.{" "}
          {outcome === "removed"
            ? listing.kind === "rattlertracks"
              ? "The next sync won't bring it back."
              : "Students can't see it anymore."
            : "It stays in the feed."}
        </span>
      </p>
      <Button
        variant="outline"
        size="lg"
        className="h-8 px-3 text-sm"
        onClick={onUndo}
      >
        Undo
      </Button>
    </li>
  );
}

function ListingItem({
  listing,
  onRemove,
}: {
  listing: Listing;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3.5 px-4 py-3">
      <DateStamp listing={listing} />
      <div className="min-w-0 flex-1 border-l pl-3.5">
        <p className="truncate font-medium tracking-tight">{listing.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {KIND_LABELS[listing.kind]}, {listing.postedBy}
        </p>
      </div>
      {listing.reports.length > 0 ? (
        <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
          {reportCountText(listing.reports.length)}
        </span>
      ) : null}
      <RemoveListingDialog
        listing={listing}
        onRemove={onRemove}
        trigger={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={`Remove listing: ${listing.title}`}
            className="text-muted-foreground"
          >
            <Trash2Icon />
          </Button>
        }
      />
    </li>
  );
}
