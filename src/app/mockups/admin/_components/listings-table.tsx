"use client";

import {
  ChevronRightIcon,
  FlagIcon,
  SearchIcon,
  SearchXIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
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
  type ListingKind,
} from "./types";
import { ActionNotice, useModeration } from "./use-moderation";

type Status = "live" | "removed";
type SourceFilter = "all" | ListingKind;

const SOURCE_ITEMS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "rattlertracks", label: "RattlerTracks" },
  { value: "club", label: "Club events" },
  { value: "quick", label: "Quick activities" },
];

/**
 * Variant B: one table of every listing. "Reported" is switched on when the
 * page opens, so the admin starts with what needs a decision; turning it off
 * (or searching) reaches everything else. A row opens a side sheet with the
 * reports, the listing, and the decisions.
 */
export function ListingsTable({ data }: { data: AdminData }) {
  const moderation = useModeration(data);
  const { live, needsReview, removed, actions } = moderation;

  const [status, setStatus] = useState<Status>("live");
  const [reportedOnly, setReportedOnly] = useState(true);
  const [source, setSource] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const reviewIds = new Set(needsReview.map((l) => l.id));
  // Searching looks through everything, even with "Reported" on.
  const base = reportedOnly && !q ? needsReview : live;
  const rows = base.filter(
    (listing) =>
      (source === "all" || listing.kind === source) &&
      `${listing.title} ${listing.postedBy} ${listing.location ?? ""}`
        .toLowerCase()
        .includes(q),
  );

  const open = live.find((l) => l.id === openId) ?? null;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {live.length} live
        </span>
        <SyncStatus className="w-full sm:ml-auto sm:w-auto" />
      </div>

      <Tabs
        value={status}
        onValueChange={(value) => setStatus(value as Status)}
      >
        <TabsList
          variant="line"
          className="mb-5 h-9 gap-4 border-b px-0 w-full justify-start rounded-none"
        >
          <TabsTrigger value="live" className="flex-none px-0 text-sm">
            Live
          </TabsTrigger>
          <TabsTrigger value="removed" className="flex-none px-0 text-sm">
            Removed
            <span className="text-muted-foreground tabular-nums">
              {removed.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {status === "live" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <InputGroup className="h-8 w-full sm:w-72">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search all listings"
                aria-label="Search all listings"
                className="text-sm md:text-sm"
              />
            </InputGroup>
            <Toggle
              variant="outline"
              pressed={reportedOnly}
              onPressedChange={setReportedOnly}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:text-foreground"
            >
              <FlagIcon className="size-3.5" />
              Reported
              <span className="tabular-nums">{needsReview.length}</span>
            </Toggle>
            <Select
              value={source}
              onValueChange={(value) => setSource(value as SourceFilter)}
              items={SOURCE_ITEMS}
            >
              <SelectTrigger
                className="h-8 rounded-full px-3 text-xs"
                aria-label="Source"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reportedOnly && q ? (
              <span className="text-sm text-muted-foreground">
                Searching all listings
              </span>
            ) : null}
          </div>

          {rows.length === 0 ? (
            reportedOnly && !q ? (
              <Empty className="border py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FlagIcon />
                  </EmptyMedia>
                  <EmptyTitle>No reported listings</EmptyTitle>
                  <EmptyDescription>
                    Everything students flagged has been handled.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="lg"
                    className={ACTION}
                    onClick={() => setReportedOnly(false)}
                  >
                    Show all listings
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <Empty className="border py-16">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <SearchXIcon />
                  </EmptyMedia>
                  <EmptyTitle>No listings match</EmptyTitle>
                  <EmptyDescription>
                    Try a club name or a different source.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="lg"
                    className={ACTION}
                    onClick={() => {
                      setQuery("");
                      setSource("all");
                    }}
                  >
                    Clear search and source
                  </Button>
                </EmptyContent>
              </Empty>
            )
          ) : (
            <div className="rounded-lg border">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14 pl-3 text-muted-foreground sm:w-16 sm:pl-4">
                      Date
                    </TableHead>
                    <TableHead className="w-[45%] text-muted-foreground">
                      Listing
                    </TableHead>
                    <TableHead className="hidden text-muted-foreground md:table-cell">
                      Source
                    </TableHead>
                    <TableHead className="hidden text-muted-foreground sm:table-cell">
                      Reports
                    </TableHead>
                    <TableHead className="w-10 pr-4">
                      <span className="sr-only">Open</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((listing) => (
                    <TableRow key={listing.id} className="relative">
                      <TableCell className="py-3 pl-3 sm:pl-4">
                        <DateStamp listing={listing} />
                      </TableCell>
                      <TableCell className="max-w-0 py-3 whitespace-normal">
                        <button
                          type="button"
                          onClick={() => setOpenId(listing.id)}
                          className="line-clamp-2 max-w-full text-left font-medium tracking-tight outline-none after:absolute after:inset-0 hover:underline hover:decoration-foreground/30 hover:underline-offset-4 focus-visible:after:ring-2 focus-visible:after:ring-ring/40 focus-visible:after:ring-inset"
                        >
                          {listing.title}
                        </button>
                        <p className="truncate text-muted-foreground">
                          {listing.postedBy}
                        </p>
                        {reviewIds.has(listing.id) ? (
                          <p className="text-muted-foreground sm:hidden">
                            {reportCountText(listing.reports.length)}:{" "}
                            {reasonsText(listing.reports)}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {KIND_LABELS[listing.kind]}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {reviewIds.has(listing.id) ? (
                          <>
                            <p className="font-medium">
                              {reasonsText(listing.reports)}
                            </p>
                            <p className="text-muted-foreground">
                              {reportCountText(listing.reports.length)}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-4 text-muted-foreground">
                        <ChevronRightIcon className="size-4" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : (
        <RemovedTable
          removed={removed}
          onRestore={(listing) => actions.restore(listing)}
        />
      )}

      <Sheet
        open={open !== null}
        onOpenChange={(next) => {
          if (!next) setOpenId(null);
        }}
      >
        {open ? (
          <DetailSheet
            listing={open}
            reported={reviewIds.has(open.id)}
            onDismiss={() => {
              setOpenId(null);
              actions.dismiss(open);
            }}
            onRemove={() => {
              setOpenId(null);
              actions.remove(open);
            }}
          />
        ) : null}
      </Sheet>

      <ActionNotice moderation={moderation} />
    </>
  );
}

function DetailSheet({
  listing,
  reported,
  onDismiss,
  onRemove,
}: {
  listing: Listing;
  reported: boolean;
  onDismiss: () => void;
  onRemove: () => void;
}) {
  return (
    <SheetContent className="gap-0 text-sm data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
      <SheetHeader className="border-b p-5 pr-12">
        <SheetTitle className="text-lg font-semibold tracking-tight">
          {listing.title}
        </SheetTitle>
        <SheetDescription className="text-sm">
          {KIND_LABELS[listing.kind]}, {listing.postedBy}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-8 overflow-y-auto p-5">
        {reported ? (
          <section>
            <h3 className="font-semibold tracking-tight">
              {reportCountText(listing.reports.length)}
              <span className="font-normal text-muted-foreground">
                {": "}
                {reasonsText(listing.reports)}
              </span>
            </h3>
            <ReportList reports={listing.reports} className="mt-1 border-y" />
          </section>
        ) : null}
        <section>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">
            What students see
          </h3>
          <ListingBody listing={listing} />
        </section>
      </div>

      <SheetFooter className="border-t p-5">
        {reported ? (
          <>
            <ReviewActions
              listing={listing}
              onDismiss={onDismiss}
              onRemove={onRemove}
            />
            <p className="text-muted-foreground">
              Dismissing keeps the listing up. Removing hides it from students.
            </p>
          </>
        ) : (
          <div>
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
      </SheetFooter>
    </SheetContent>
  );
}

function RemovedTable({
  removed,
  onRestore,
}: {
  removed: ReturnType<typeof useModeration>["removed"];
  onRestore: (listing: Listing) => void;
}) {
  if (removed.length === 0) {
    return (
      <p className="rounded-lg border px-4 py-12 text-center text-sm text-muted-foreground">
        Nothing removed. Listings you remove stay here so you can restore them.
      </p>
    );
  }
  return (
    <>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Students can't see these. The daily RattlerTracks sync keeps them
        hidden, even if RattlerTracks still lists them. Restore one to put it
        back in the feed.
      </p>
      <div className="rounded-lg border">
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 text-muted-foreground">
                Listing
              </TableHead>
              <TableHead className="hidden text-muted-foreground md:table-cell">
                Reason
              </TableHead>
              <TableHead className="hidden text-muted-foreground sm:table-cell">
                Removed
              </TableHead>
              <TableHead className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {removed.map((entry) => (
              <TableRow key={entry.listing.id}>
                <TableCell className="max-w-0 py-3 pl-4 whitespace-normal">
                  <p className="truncate font-medium tracking-tight">
                    {entry.listing.title}
                  </p>
                  <p className="truncate text-muted-foreground">
                    {KIND_LABELS[entry.listing.kind]}
                    <span className="sm:hidden">
                      , removed {formatShort(entry.removedAt)}
                    </span>
                  </p>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {entry.reason}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatShort(entry.removedAt)}
                  <br />
                  by {entry.removedBy}
                </TableCell>
                <TableCell className={cn("w-0 pr-4 text-right")}>
                  <RestoreButton onRestore={() => onRestore(entry.listing)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
