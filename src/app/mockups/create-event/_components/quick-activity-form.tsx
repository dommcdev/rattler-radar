"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatTime, MOCK_NOW, TODAY, toDate } from "./draft";
import { Published } from "./published";
import { BIG_BUTTON } from "./styles";

/**
 * A quick, student-posted activity (RE-17): what, when, where. No approval
 * step, so it's three questions and a button. Suggestions are one tap so
 * posting from a phone takes seconds.
 */

type When = "now" | "1h" | "tonight" | "pick";

interface QuickDraft {
  what: string;
  when: When | null;
  /** `hh:mm` today, when `when` is "pick". */
  pickTime: string;
  where: string;
}

type QuickField = "what" | "when" | "pickTime" | "where";

const EMPTY: QuickDraft = { what: "", when: null, pickTime: "", where: "" };

const WHAT_IDEAS = [
  "Pickup basketball",
  "Study group",
  "Food run to The Pearl",
  "Movie night",
];
const WHERE_IDEAS = [
  "Intramural Field",
  "Blume Library",
  "University Center",
  "Treadaway Hall lounge",
];

const ONE_HOUR = 60 * 60 * 1000;
const TONIGHT = toDate(TODAY, "20:00");

const WHEN_OPTIONS: { id: When; label: string; detail: string }[] = [
  { id: "now", label: "Now", detail: formatTime(MOCK_NOW) },
  {
    id: "1h",
    label: "In 1 hour",
    detail: formatTime(new Date(MOCK_NOW.getTime() + ONE_HOUR)),
  },
  { id: "tonight", label: "Tonight", detail: formatTime(TONIGHT) },
  { id: "pick", label: "Pick a time", detail: "Later today" },
];

function validate(draft: QuickDraft): Partial<Record<QuickField, string>> {
  const errors: Partial<Record<QuickField, string>> = {};
  if (!draft.what.trim()) errors.what = "Say what you're doing.";
  if (!draft.when) errors.when = "Pick when it starts.";
  if (draft.when === "pick") {
    if (!draft.pickTime) errors.pickTime = "Pick a start time.";
    else if (toDate(TODAY, draft.pickTime) <= MOCK_NOW)
      errors.pickTime = `${formatTime(toDate(TODAY, draft.pickTime))} has already passed. Pick a later time.`;
  }
  if (!draft.where.trim()) errors.where = "Say where to meet.";
  return errors;
}

const ORDER: QuickField[] = ["what", "when", "pickTime", "where"];

/** The start time for the posted summary: "2:00 PM", "8:00 PM", etc. */
function startTime(draft: QuickDraft): string {
  switch (draft.when) {
    case "now":
      return WHEN_OPTIONS[0].detail;
    case "1h":
      return WHEN_OPTIONS[1].detail;
    case "tonight":
      return WHEN_OPTIONS[2].detail;
    default:
      return draft.pickTime ? formatTime(toDate(TODAY, draft.pickTime)) : "";
  }
}

export function QuickActivityForm({
  className,
  onDone,
  formId,
  showSubmit = true,
  onPostedChange,
  successHeadingLevel,
  stickySubmit = false,
}: {
  className?: string;
  /** Shown as a "Done" button after posting (e.g. to close a sheet). */
  onDone?: () => void;
  /** Lets a submit button elsewhere on the page post this form. */
  formId?: string;
  showSubmit?: boolean;
  onPostedChange?: (isPosted: boolean) => void;
  successHeadingLevel?: "h1" | "h2";
  /** Pin the button to the bottom of a scrolling sheet (which pads by 1.25rem). */
  stickySubmit?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState(EMPTY);
  const [hasTried, setHasTried] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const refs = useRef<Partial<Record<QuickField, HTMLElement | null>>>({});

  const errors = hasTried ? validate(draft) : {};

  function set<K extends keyof QuickDraft>(field: K, value: QuickDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function register(field: QuickField) {
    return (element: HTMLElement | null) => {
      refs.current[field] = element;
    };
  }

  function post(event: React.FormEvent) {
    event.preventDefault();
    setHasTried(true);
    const first = ORDER.find((field) => validate(draft)[field]);
    if (first) {
      const element = refs.current[first];
      const target = element?.matches("input")
        ? element
        : element?.querySelector<HTMLElement>("input");
      target?.focus();
      return;
    }
    setIsPosted(true);
    onPostedChange?.(true);
  }

  if (isPosted) {
    return (
      <div className={className}>
        <Published
          title="Activity posted"
          headingLevel={successHeadingLevel}
          viewLabel="View activity"
          againLabel={onDone ? "Done" : "Post another"}
          onAgain={() => {
            if (onDone) onDone();
            else {
              setDraft(EMPTY);
              setHasTried(false);
              setIsPosted(false);
              onPostedChange?.(false);
            }
          }}
          preview={
            // Same row the For you page shows for activities.
            <div className="flex items-center gap-4 border-y py-3">
              <span className="w-16 shrink-0 text-sm font-medium tabular-nums">
                {startTime(draft)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">
                  {draft.what.trim()}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {draft.where.trim()}, posted by you
                </p>
              </div>
            </div>
          }
        >
          Students nearby can see it and join now. It comes down on its own 3
          hours after it starts.
        </Published>
      </div>
    );
  }

  return (
    <form
      id={formId}
      noValidate
      onSubmit={post}
      className={cn("space-y-6", className)}
    >
      {/* What */}
      <div className="space-y-2.5">
        <label
          htmlFor={`${id}-what`}
          className={cn(
            "block text-[15px] font-semibold tracking-tight",
            errors.what && "text-destructive",
          )}
        >
          What are you doing?
        </label>
        <Input
          id={`${id}-what`}
          ref={register("what")}
          value={draft.what}
          onChange={(event) => set("what", event.target.value)}
          placeholder="Pickup soccer, need 4 more"
          maxLength={60}
          enterKeyHint="next"
          aria-invalid={Boolean(errors.what) || undefined}
          aria-describedby={errors.what ? `${id}-what-error` : undefined}
          className="h-11 px-3 text-base md:text-base"
        />
        {errors.what ? (
          <FieldError id={`${id}-what-error`} className="text-sm">
            {errors.what}
          </FieldError>
        ) : null}
        <Ideas ideas={WHAT_IDEAS} onPick={(value) => set("what", value)} />
      </div>

      {/* When */}
      <fieldset
        ref={register("when")}
        aria-describedby={errors.when ? `${id}-when-error` : undefined}
        className="space-y-2.5"
      >
        <legend
          className={cn(
            "mb-2.5 text-[15px] font-semibold tracking-tight",
            errors.when && "text-destructive",
          )}
        >
          When?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {WHEN_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={cn(
                "flex min-h-16 cursor-pointer flex-col justify-center rounded-lg border px-4 py-2.5 transition-colors has-checked:border-foreground has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring/30 hover:border-foreground/30",
                errors.when && "border-destructive/50",
              )}
            >
              <input
                type="radio"
                name={`${id}-when`}
                value={option.id}
                checked={draft.when === option.id}
                onChange={() => set("when", option.id)}
                className="sr-only"
              />
              <span className="text-[15px] font-medium">{option.label}</span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {option.detail}
              </span>
            </label>
          ))}
        </div>
        {errors.when ? (
          <FieldError id={`${id}-when-error`} className="text-sm">
            {errors.when}
          </FieldError>
        ) : null}
        {draft.when === "pick" ? (
          <div className="space-y-2 pt-1">
            <label
              htmlFor={`${id}-time`}
              className="block text-sm font-medium text-muted-foreground"
            >
              Start time today
            </label>
            <Input
              id={`${id}-time`}
              type="time"
              step={300}
              ref={register("pickTime")}
              value={draft.pickTime}
              onChange={(event) => set("pickTime", event.target.value)}
              aria-invalid={Boolean(errors.pickTime) || undefined}
              aria-describedby={
                errors.pickTime ? `${id}-time-error` : undefined
              }
              className="h-11 px-3 text-base md:text-base dark:[color-scheme:dark]"
            />
            {errors.pickTime ? (
              <FieldError id={`${id}-time-error`} className="text-sm">
                {errors.pickTime}
              </FieldError>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      {/* Where */}
      <div className="space-y-2.5">
        <label
          htmlFor={`${id}-where`}
          className={cn(
            "block text-[15px] font-semibold tracking-tight",
            errors.where && "text-destructive",
          )}
        >
          Where?
        </label>
        <Input
          id={`${id}-where`}
          ref={register("where")}
          value={draft.where}
          onChange={(event) => set("where", event.target.value)}
          placeholder="Somewhere people can find you"
          enterKeyHint="done"
          aria-invalid={Boolean(errors.where) || undefined}
          aria-describedby={errors.where ? `${id}-where-error` : undefined}
          className="h-11 px-3 text-base md:text-base"
        />
        {errors.where ? (
          <FieldError id={`${id}-where-error`} className="text-sm">
            {errors.where}
          </FieldError>
        ) : null}
        <Ideas ideas={WHERE_IDEAS} onPick={(value) => set("where", value)} />
      </div>

      <div
        className={cn(
          "space-y-3 pt-1",
          stickySubmit &&
            "sticky bottom-0 -mx-5 -mb-6 space-y-2 border-t bg-popover px-5 pt-3 pb-4",
          !showSubmit && "hidden",
        )}
      >
        <Button
          type="submit"
          className={cn(BIG_BUTTON, "h-11 w-full text-[15px]")}
        >
          Post activity
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Goes up right away. It comes down 3 hours after it starts.
        </p>
      </div>
    </form>
  );
}

/** One-tap fills for the field above. */
function Ideas({
  ideas,
  onPick,
}: {
  ideas: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1.5 sm:w-auto sm:flex-wrap">
        {ideas.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => onPick(idea)}
            className="h-8 shrink-0 rounded-full border px-3 text-[13px] text-muted-foreground transition-colors outline-none hover:border-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {idea}
          </button>
        ))}
      </div>
    </div>
  );
}
