"use client";

import {
  ChevronLeftIcon,
  InboxIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  ACTION,
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
import {
  type AdminData,
  KIND_LABELS,
  type Listing,
  type RemovedListing,
} from "./types";
import { ActionNotice, useModeration } from "./use-moderation";

type View = "review" | "all" | "removed";

const PILL =
  "h-7 rounded-full px-3 text-xs text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground";

/**
 * Variant A: an inbox. The queue of reported listings on the left, the
 * selected one on the right with its reports, details, and the two
 * decisions. Deciding moves straight on to the next item.
 */
export function ReviewInbox({ data }: { data: AdminData }) {
  const moderation = useModeration(data);
  const { live, needsReview, removed, actions } = moderation;

  const [view, setView] = useState<View>("review");
  const [selectedId, setSelectedId] = useState<string | null>(
    needsReview[0]?.id ?? null,
  );
  // On phones the list and the details take turns filling the screen.
  const [showDetailOnPhone, setShowDetailOnPhone] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const allMatches = live.filter((listing) =>
    `${listing.title} ${listing.postedBy} ${listing.location ?? ""}`
      .toLowerCase()
      .includes(q),
  );

  const selectedRemoved = removed.find((e) => e.listing.id === selectedId);
  const selectedLive = live.find((l) => l.id === selectedId);

  function select(id: string) {
    setSelectedId(id);
    setShowDetailOnPhone(true);
  }

  function changeView(next: View) {
    setView(next);
    setShowDetailOnPhone(false);
    const first =
      next === "review"
        ? needsReview[0]?.id
        : next === "all"
          ? live[0]?.id
          : removed[0]?.listing.id;
    setSelectedId(first ?? null);
  }

  /** After a decision in the queue, open the next reported item. */
  function moveOn(listing: Listing) {
    if (view !== "review") return;
    const index = needsReview.findIndex((l) => l.id === listing.id);
    const next = needsReview[index + 1] ?? needsReview[index - 1];
    setSelectedId(next?.id ?? null);
    if (!next) setShowDetailOnPhone(false);
  }

  const counts = {
    review: needsReview.length,
    all: live.length,
    removed: removed.length,
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {needsReview.length === 0
            ? "All caught up"
            : `${needsReview.length} to review`}
        </span>
        <SyncStatus className="w-full sm:ml-auto sm:w-auto" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* List */}
        <div className={cn("min-w-0", showDetailOnPhone && "hidden lg:block")}>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ToggleGroup
              variant="outline"
              spacing={1.5}
              value={[view]}
              onValueChange={([value]) => value && changeView(value as View)}
              aria-label="Which listings"
            >
              {(
                [
                  ["review", "Needs review"],
                  ["all", "All listings"],
                  ["removed", "Removed"],
                ] as const
              ).map(([id, label]) => (
                <ToggleGroupItem key={id} value={id} className={PILL}>
                  {label}
                  <span className="text-muted-foreground tabular-nums">
                    {counts[id]}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {view === "all" ? (
            <InputGroup className="mt-4 h-8">
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
          ) : null}

          <div className="mt-4">
            {view === "review" ? (
              needsReview.length === 0 ? (
                <Empty className="border py-14">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <InboxIcon />
                    </EmptyMedia>
                    <EmptyTitle>All caught up</EmptyTitle>
                    <EmptyDescription>
                      When students report a listing, it shows up here.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => changeView("all")}
                    >
                      Browse all listings
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {needsReview.map((listing) => (
                    <QueueRow
                      key={listing.id}
                      listing={listing}
                      selected={listing.id === selectedId}
                      onSelect={() => select(listing.id)}
                    />
                  ))}
                </ul>
              )
            ) : view === "all" ? (
              allMatches.length === 0 ? (
                <p className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
                  No listings match “{query}”.
                </p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {allMatches.map((listing) => (
                    <ListingRow
                      key={listing.id}
                      listing={listing}
                      selected={listing.id === selectedId}
                      onSelect={() => select(listing.id)}
                    />
                  ))}
                </ul>
              )
            ) : removed.length === 0 ? (
              <p className="rounded-lg border px-4 py-10 text-center text-sm text-muted-foreground">
                Nothing removed. Removed listings stay here so you can restore
                them.
              </p>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  Hidden from students. The daily sync keeps these hidden even
                  if RattlerTracks still lists them.
                </p>
                <ul className="divide-y rounded-lg border">
                  {removed.map((entry) => (
                    <RemovedRow
                      key={entry.listing.id}
                      entry={entry}
                      selected={entry.listing.id === selectedId}
                      onSelect={() => select(entry.listing.id)}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <section
          aria-label="Selected listing"
          className={cn("min-w-0", !showDetailOnPhone && "hidden lg:block")}
        >
          <Button
            variant="ghost"
            size="lg"
            className="-ml-2 mb-3 text-sm text-muted-foreground lg:hidden"
            onClick={() => setShowDetailOnPhone(false)}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Back to list
          </Button>

          {selectedRemoved ? (
            <RemovedDetail
              entry={selectedRemoved}
              onRestore={() => {
                actions.restore(selectedRemoved.listing);
                setSelectedId(null);
                setShowDetailOnPhone(false);
              }}
            />
          ) : selectedLive ? (
            <LiveDetail
              listing={selectedLive}
              inQueue={needsReview.some((l) => l.id === selectedLive.id)}
              onDismiss={() => {
                moveOn(selectedLive);
                actions.dismiss(selectedLive);
              }}
              onRemove={() => {
                moveOn(selectedLive);
                if (view !== "review") {
                  setSelectedId(null);
                  setShowDetailOnPhone(false);
                }
                actions.remove(selectedLive);
              }}
            />
          ) : (
            <div className="hidden h-64 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground lg:grid">
              {view === "review" && needsReview.length === 0
                ? "Nothing left to review."
                : "Select a listing to see its details."}
            </div>
          )}
        </section>
      </div>

      <ActionNotice moderation={moderation} />
    </>
  );
}

function rowClass(selected: boolean) {
  return cn(
    "flex w-full gap-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset first:rounded-t-lg last:rounded-b-lg",
    selected && "bg-muted hover:bg-muted",
  );
}

function QueueRow({
  listing,
  selected,
  onSelect,
}: {
  listing: Listing;
  selected: boolean;
  onSelect: () => void;
}) {
  const latest = listing.reports.toSorted(
    (a, b) => Date.parse(b.reportedAt) - Date.parse(a.reportedAt),
  )[0];
  return (
    <li className="group">
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={rowClass(selected)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate font-medium tracking-tight">
              {listing.title}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {formatShort(latest.reportedAt)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-foreground/80">
            {reasonsText(listing.reports)}
            {listing.reports.length > 1 ? (
              <span className="text-muted-foreground">
                , {reportCountText(listing.reports.length)}
              </span>
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            “{latest.note}”
          </p>
        </div>
      </button>
    </li>
  );
}

function ListingRow({
  listing,
  selected,
  onSelect,
}: {
  listing: Listing;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(rowClass(selected), "items-center")}
      >
        <DateStamp listing={listing} />
        <div className="min-w-0 flex-1 border-l pl-3">
          <p className="truncate font-medium tracking-tight">{listing.title}</p>
          <p className="truncate text-sm text-muted-foreground">
            {KIND_LABELS[listing.kind]}, {listing.postedBy}
          </p>
        </div>
        {listing.reports.length > 0 ? (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {reportCountText(listing.reports.length)}
          </span>
        ) : null}
      </button>
    </li>
  );
}

function RemovedRow({
  entry,
  selected,
  onSelect,
}: {
  entry: RemovedListing;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={rowClass(selected)}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium tracking-tight">
            {entry.listing.title}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Removed {formatShort(entry.removedAt)}, {entry.reason.toLowerCase()}
          </p>
        </div>
      </button>
    </li>
  );
}

function DetailHeading({ listing }: { listing: Listing }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-balance">
        {listing.title}
      </h2>
      <p className="mt-1 text-muted-foreground">
        {listing.kind === "quick" ? "Posted by " : "Hosted by "}
        <span className="text-foreground">{listing.postedBy}</span>
      </p>
    </div>
  );
}

function LiveDetail({
  listing,
  inQueue,
  onDismiss,
  onRemove,
}: {
  listing: Listing;
  inQueue: boolean;
  onDismiss: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="max-w-[960px]">
      <DetailHeading listing={listing} />

      {inQueue ? (
        <>
          <ReviewActions
            listing={listing}
            onDismiss={onDismiss}
            onRemove={onRemove}
            className="mt-5"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Dismissing keeps the listing up. Removing hides it from students.
          </p>

          <section className="mt-8">
            <h3 className="font-semibold tracking-tight">
              {reportCountText(listing.reports.length)}
              <span className="font-normal text-muted-foreground">
                {": "}
                {reasonsText(listing.reports)}
              </span>
            </h3>
            <ReportList reports={listing.reports} className="mt-1 border-y" />
          </section>
        </>
      ) : (
        <div className="mt-5">
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
      )}

      <section className="mt-8">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          What students see
        </h3>
        <ListingBody listing={listing} side />
      </section>
    </article>
  );
}

function RemovedDetail({
  entry,
  onRestore,
}: {
  entry: RemovedListing;
  onRestore: () => void;
}) {
  return (
    <article className="max-w-[960px]">
      <DetailHeading listing={entry.listing} />
      <div className="mt-5 rounded-lg border p-4">
        <p className="font-medium">
          Removed {formatShort(entry.removedAt)} by {entry.removedBy}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Reason: {entry.reason}. Students can't see it, and the RattlerTracks
          sync keeps it hidden. Restoring puts it back in the feed.
        </p>
        <div className="mt-3">
          <RestoreButton onRestore={onRestore} />
        </div>
      </div>
      <section className="mt-8">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          The listing
        </h3>
        <ListingBody listing={entry.listing} side />
      </section>
    </article>
  );
}
