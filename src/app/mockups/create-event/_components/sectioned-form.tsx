"use client";

import { type ReactNode, useState } from "react";
import { EventCard } from "@/components/event-feed/event-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_CLUB } from "../../_lib/data";
import { draftToFeedEvent, followerCount, joinInterests } from "./draft";
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
import { QuickActivityForm } from "./quick-activity-form";
import { BIG_BUTTON } from "./styles";
import { useEventDraft } from "./use-event-draft";

type Kind = "club" | "quick";

const QUICK_FORM_ID = "quick-activity";

const KINDS: { id: Kind; label: string; detail: string }[] = [
  {
    id: "club",
    label: "Club event",
    detail: `As ${MOCK_CLUB.name}, with an event page.`,
  },
  {
    id: "quick",
    label: "Quick activity",
    detail: "As you, for something today.",
  },
];

/**
 * Variant A: one column, grouped into Basics, When and where, and Tags.
 * The title row sticks under the header with the publish button, so the
 * action (and how many things still need fixing) is always in reach.
 * A leader picks "Club event" or "Quick activity" first.
 */
export function SectionedForm() {
  const form = useEventDraft();
  const [kind, setKind] = useState<Kind>("club");
  const [isQuickPosted, setIsQuickPosted] = useState(false);

  const isDone = kind === "club" ? form.isPublished : isQuickPosted;

  return (
    <>
      <div
        hidden={isDone}
        className="sticky top-14 z-30 border-b bg-background/85 backdrop-blur"
      >
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {kind === "club" ? "New club event" : "New quick activity"}
            </h1>
          </div>
          {isDone ? null : (
            <div className="flex items-center gap-3">
              {kind === "club" && form.errorCount > 0 ? (
                <p
                  className="hidden text-sm text-destructive sm:block"
                  aria-live="polite"
                >
                  {form.errorCount === 1
                    ? "1 thing to fix"
                    : `${form.errorCount} things to fix`}
                </p>
              ) : null}
              {kind === "club" ? (
                <Button className={BIG_BUTTON} onClick={() => form.publish()}>
                  Publish event
                </Button>
              ) : (
                <Button
                  type="submit"
                  form={QUICK_FORM_ID}
                  className={BIG_BUTTON}
                >
                  Post activity
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28 sm:px-6">
        {isDone ? null : (
          <KindPicker value={kind} onChange={setKind} className="mt-5" />
        )}

        {kind === "quick" ? (
          <QuickActivityForm
            className="mt-8"
            formId={QUICK_FORM_ID}
            showSubmit={false}
            onPostedChange={setIsQuickPosted}
            successHeadingLevel="h1"
          />
        ) : form.isPublished ? (
          <div className="mt-8">
            <Published
              title="Event published"
              headingLevel="h1"
              viewLabel="View event"
              againLabel="Create another event"
              onAgain={form.reset}
              preview={<EventCard event={draftToFeedEvent(form.draft)} />}
            >
              It's on the Events feed now, and in For you for about{" "}
              <span className="tabular-nums">
                {followerCount(form.draft.interests)}
              </span>{" "}
              students who follow {joinInterests(form.draft.interests)}.
            </Published>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              form.publish();
            }}
            className="mt-2"
          >
            <Section
              title="Basics"
              description="What students see first in the feed."
            >
              <TitleField form={form} />
              <DescriptionField form={form} />
              <FlyerField form={form} />
            </Section>

            <Section title="When and where">
              <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr_1fr]">
                <DateField form={form} />
                <div className="grid grid-cols-2 gap-3 sm:contents">
                  <TimeField form={form} field="startTime" />
                  <TimeField form={form} field="endTime" />
                </div>
              </div>
              <LocationField form={form} />
            </Section>

            <Section
              title="Tags"
              description="Students who follow these tags see the event in For you."
            >
              <TagsField form={form} hideLabel />
            </Section>

            <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
              Publishing as{" "}
              <span className="font-medium text-foreground">
                {MOCK_CLUB.name}
              </span>
              . You can edit or cancel it later from My events.
            </p>
            {/* Lets Enter in a text field publish, like the button above. */}
            <button type="submit" hidden />
          </form>
        )}
      </main>
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 border-t pt-6 mt-8 first:mt-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Two big radio cards: which kind of thing this is. */
function KindPicker({
  value,
  onChange,
  className,
}: {
  value: Kind;
  onChange: (kind: Kind) => void;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="sr-only">What are you posting?</legend>
      <div className="grid grid-cols-2 gap-2">
        {KINDS.map((kind) => (
          <label
            key={kind.id}
            className={cn(
              "flex cursor-pointer flex-col gap-0.5 rounded-lg border px-4 py-3 transition-colors hover:border-foreground/30 has-checked:border-foreground has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring/30",
            )}
          >
            <input
              type="radio"
              name="kind"
              value={kind.id}
              checked={value === kind.id}
              onChange={() => onChange(kind.id)}
              className="sr-only"
            />
            <span className="text-[15px] font-medium">{kind.label}</span>
            <span className="text-sm text-muted-foreground">{kind.detail}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
