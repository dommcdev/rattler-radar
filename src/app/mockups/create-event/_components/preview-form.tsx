"use client";

import { ChevronLeftIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { EventCard } from "@/components/event-feed/event-card";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FeedEvent } from "@/lib/events/feed-event";
import { cn } from "@/lib/utils";
import { MOCK_CLUB } from "../../_lib/data";
import {
  draftToFeedEvent,
  type EventDraft,
  followerCount,
  joinInterests,
  TODAY,
} from "./draft";
import {
  DateField,
  DescriptionField,
  FlyerField,
  LocationField,
  TagsField,
  TimeField,
  TitleField,
} from "./fields";
import { Published } from "./published";
import { BIG_BUTTON } from "./styles";
import { useEventDraft } from "./use-event-draft";

/**
 * A half-finished draft, so the preview has something to show. The start
 * time is already past (it's 2 PM), which "Publish event" catches.
 */
const STARTER: EventDraft = {
  title: "Coat Drive Sorting Night",
  description:
    "Help us sort and fold the coats collected this month before they go to SAMMinistries. Pizza for volunteers. No experience needed.",
  date: TODAY,
  startTime: "09:00",
  endTime: "",
  location: "University Center, Conference Room A",
  interests: ["service"],
  flyerUrl: null,
};

/**
 * Variant B: the form on the left and, on the right, the event exactly as
 * students will see it (the real feed card, or a sketch of its page),
 * updating as the leader types. Publish sits under the preview: check it,
 * then send it.
 */
export function PreviewForm() {
  const form = useEventDraft(STARTER);
  const event = draftToFeedEvent(form.draft);

  if (form.isPublished) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-28 sm:px-6">
        <Published
          title="Event published"
          headingLevel="h1"
          viewLabel="View event"
          againLabel="Create another event"
          onAgain={form.reset}
          preview={<EventCard event={event} />}
        >
          <span className="text-foreground">{event.title}</span> is on the
          Events feed now, and in For you for about{" "}
          <span className="tabular-nums">
            {followerCount(form.draft.interests)}
          </span>{" "}
          students who follow {joinInterests(form.draft.interests)}.
        </Published>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 pt-5 pb-28 sm:px-6">
      <Link
        href="#"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        My events
      </Link>

      <div className="mt-4 grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_360px]">
        <form
          noValidate
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            form.publish();
          }}
          className="min-w-0"
        >
          <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
          <p className="mt-1 text-muted-foreground">
            Hosted by <span className="text-foreground">{MOCK_CLUB.name}</span>
          </p>

          <div className="mt-8 space-y-6">
            <TitleField form={form} />
            <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr_1fr]">
              <DateField form={form} />
              <div className="grid grid-cols-2 gap-3 sm:contents">
                <TimeField form={form} field="startTime" />
                <TimeField form={form} field="endTime" />
              </div>
            </div>
            <LocationField form={form} />
            <FlyerField form={form} />
            <DescriptionField form={form} rows={4} />
            <div className="border-t pt-6">
              <TagsField form={form} />
            </div>
          </div>
          <button type="submit" hidden />
        </form>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Preview event={event} draft={form.draft} />

          <div className="mt-6 space-y-3 border-t pt-5">
            <Reach interests={form.draft.interests} />
            <Button
              className={cn(BIG_BUTTON, "h-11 w-full sm:h-9")}
              onClick={() => form.publish()}
            >
              Publish event
            </Button>
            {form.errorCount > 0 ? (
              <p className="text-sm text-destructive" aria-live="polite">
                {form.errorCount === 1
                  ? "Fix the highlighted field to publish."
                  : `Fix the ${form.errorCount} highlighted fields to publish.`}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Preview({ event, draft }: { event: FeedEvent; draft: EventDraft }) {
  return (
    <Tabs defaultValue="card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Preview</h2>
        <TabsList>
          <TabsTrigger value="card" className="px-2.5 text-xs">
            Feed card
          </TabsTrigger>
          <TabsTrigger value="page" className="px-2.5 text-xs">
            Event page
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="card" className="mt-4">
        {/* inert: it's a picture of the card, not a link to follow. */}
        <div
          inert
          className={cn(!draft.title && "[&_h3]:text-muted-foreground")}
        >
          <EventCard event={event} loading="eager" />
        </div>
      </TabsContent>
      <TabsContent value="page" className="mt-4">
        <PagePreview event={event} draft={draft} />
      </TabsContent>
    </Tabs>
  );
}

/** The top of the event page, shrunk to fit the column. */
function PagePreview({
  event,
  draft,
}: {
  event: FeedEvent;
  draft: EventDraft;
}) {
  return (
    <div inert className="rounded-lg border p-4">
      <p
        className={cn(
          "text-xl leading-tight font-semibold tracking-tight text-balance",
          !draft.title && "text-muted-foreground",
        )}
      >
        {event.title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Hosted by <span className="text-foreground">{MOCK_CLUB.name}</span>
      </p>
      {event.imageUrl ? (
        <EventFlyer
          src={event.imageUrl}
          sizes="360px"
          className="mt-3 aspect-[5/3] rounded-md ring-1 ring-border"
        />
      ) : null}
      <div className="mt-3 divide-y rounded-md border">
        <div className="flex items-center gap-3 p-3">
          <time
            dateTime={event.startsAt}
            className="flex w-11 shrink-0 flex-col overflow-hidden rounded-md border text-center"
          >
            <span className="bg-muted py-px text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {event.start.month}
            </span>
            <span className="py-1 text-lg leading-none font-semibold tabular-nums">
              {event.start.day}
            </span>
          </time>
          <div className="min-w-0 text-sm">
            <p className="font-semibold tracking-tight">{event.when.date}</p>
            <p className="text-muted-foreground">{event.when.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3">
          <span className="flex w-11 shrink-0 justify-center text-muted-foreground">
            <MapPinIcon className="size-4" />
          </span>
          <p className="min-w-0 text-sm font-semibold tracking-tight">
            {event.location ?? "Location to be announced"}
          </p>
        </div>
      </div>
      {draft.description.trim() ? (
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-foreground/85">
          {draft.description}
        </p>
      ) : null}
    </div>
  );
}

/** Where the event will show up, so tags feel like a choice with a result. */
function Reach({ interests }: { interests: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      <li className="flex justify-between gap-3">
        <span className="text-muted-foreground">Events feed</span>
        <span>Everyone</span>
      </li>
      <li className="flex justify-between gap-3">
        <span className="text-muted-foreground">For you</span>
        {interests.length > 0 ? (
          <span className="tabular-nums">
            About {followerCount(interests)} students
          </span>
        ) : (
          <span className="text-muted-foreground">Add a tag</span>
        )}
      </li>
    </ul>
  );
}
