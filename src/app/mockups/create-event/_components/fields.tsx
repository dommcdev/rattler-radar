"use client";

import { CheckIcon, ImageUpIcon } from "lucide-react";
import { type ReactNode, useId } from "react";
import { EventFlyer } from "@/components/event-feed/event-flyer";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { INTEREST_GROUPS } from "../../_lib/data";
import { TITLE_MAX, TODAY } from "./draft";
import type { useEventDraft } from "./use-event-draft";

/**
 * The club event form's fields, one component each, so variants can arrange
 * them however they like. Inputs are a size up from the shadcn defaults:
 * this is a form people fill in on phones.
 */

type Form = ReturnType<typeof useEventDraft>;

export const INPUT_CLASS = "h-9 px-3 text-sm text-foreground md:text-sm";
const NATIVE_PICKER_CLASS = "dark:[color-scheme:dark]";

/** Common campus spots, offered as suggestions in the location field. */
export const CAMPUS_PLACES = [
  "University Center, Conference Room A",
  "University Center Ballroom",
  "Blume Library",
  "Alkek Business Building 103",
  "Barrett Memorial Tower Plaza",
  "Reinbolt 101",
  "Intramural Field",
  "Treadaway Hall",
];

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <FieldLabel htmlFor={htmlFor} className="text-sm">
      {children}
      {optional ? (
        <span className="font-normal text-muted-foreground">Optional</span>
      ) : null}
    </FieldLabel>
  );
}

/** Error text with an id, so the input can point at it. */
function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <FieldError id={id} className="text-sm">
      {message}
    </FieldError>
  );
}

export function TitleField({ form }: { form: Form }) {
  const id = useId();
  const error = form.errors.title;
  const length = form.draft.title.length;
  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <Label htmlFor={id}>Title</Label>
      <Input
        id={id}
        ref={form.register("title")}
        value={form.draft.title}
        onChange={(event) => form.set("title", event.target.value)}
        placeholder="What's the event called?"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={INPUT_CLASS}
      />
      {error ? (
        <ErrorText id={`${id}-error`} message={error} />
      ) : length > TITLE_MAX - 20 ? (
        <FieldDescription className="text-sm tabular-nums">
          {TITLE_MAX - length} characters left
        </FieldDescription>
      ) : null}
    </Field>
  );
}

export function DescriptionField({
  form,
  rows = 5,
}: {
  form: Form;
  rows?: number;
}) {
  const id = useId();
  return (
    <Field>
      <Label htmlFor={id} optional>
        Description
      </Label>
      <Textarea
        id={id}
        rows={rows}
        value={form.draft.description}
        onChange={(event) => form.set("description", event.target.value)}
        placeholder="What will people do, and what should they bring?"
        className="field-sizing-fixed min-h-28 px-3 text-sm md:text-sm"
      />
    </Field>
  );
}

export function DateField({ form }: { form: Form }) {
  const id = useId();
  const error = form.errors.date;
  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <Label htmlFor={id}>Date</Label>
      <Input
        id={id}
        type="date"
        min={TODAY}
        ref={form.register("date")}
        value={form.draft.date}
        onChange={(event) => form.set("date", event.target.value)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(INPUT_CLASS, NATIVE_PICKER_CLASS)}
      />
      <ErrorText id={`${id}-error`} message={error} />
    </Field>
  );
}

export function TimeField({
  form,
  field,
}: {
  form: Form;
  field: "startTime" | "endTime";
}) {
  const id = useId();
  const error = form.errors[field];
  const isEnd = field === "endTime";
  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <Label htmlFor={id} optional={isEnd}>
        {isEnd ? "Ends" : "Starts"}
      </Label>
      <Input
        id={id}
        type="time"
        step={300}
        ref={form.register(field)}
        value={form.draft[field]}
        onChange={(event) => form.set(field, event.target.value)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(INPUT_CLASS, NATIVE_PICKER_CLASS)}
      />
      <ErrorText id={`${id}-error`} message={error} />
    </Field>
  );
}

export function LocationField({ form }: { form: Form }) {
  const id = useId();
  const error = form.errors.location;
  return (
    <Field data-invalid={Boolean(error) || undefined}>
      <Label htmlFor={id}>Location</Label>
      <Input
        id={id}
        list={`${id}-places`}
        ref={form.register("location")}
        value={form.draft.location}
        onChange={(event) => form.set("location", event.target.value)}
        placeholder="Building and room, or an address"
        autoComplete="off"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={INPUT_CLASS}
      />
      <datalist id={`${id}-places`}>
        {CAMPUS_PLACES.map((place) => (
          <option key={place} value={place} />
        ))}
      </datalist>
      <ErrorText id={`${id}-error`} message={error} />
    </Field>
  );
}

/** Pills grouped like onboarding's interests. A check marks picked tags. */
export function TagsField({
  form,
  hideLabel = false,
  description = "Students who follow these tags see the event in For you.",
}: {
  form: Form;
  hideLabel?: boolean;
  description?: string;
}) {
  const id = useId();
  const error = form.errors.interests;
  return (
    <fieldset
      aria-describedby={error ? `${id}-error` : `${id}-description`}
      ref={form.register("interests")}
      className="space-y-3"
    >
      <legend
        className={cn(
          "text-sm font-medium",
          error && "text-destructive",
          hideLabel && "sr-only",
        )}
      >
        Tags
      </legend>
      <p
        id={`${id}-description`}
        className={cn(
          "mt-1! text-sm text-muted-foreground",
          hideLabel && "sr-only",
        )}
      >
        {description}
      </p>
      {INTEREST_GROUPS.map((group) => (
        <div key={group.id} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {group.label}
          </p>
          <ToggleGroup
            multiple
            variant="outline"
            spacing={1.5}
            value={form.draft.interests}
            onValueChange={(value) =>
              // Keep tags from other groups when this group changes.
              form.set("interests", [
                ...form.draft.interests.filter(
                  (interest) =>
                    !group.interests.some((item) => item.id === interest),
                ),
                ...value,
              ])
            }
            className="flex-wrap"
            aria-label={group.label}
          >
            {group.interests.map((interest) => (
              <ToggleGroupItem
                key={interest.id}
                value={interest.id}
                className="group/tag h-8 rounded-full px-3 text-[13px] font-normal text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:font-medium aria-pressed:text-foreground"
              >
                <CheckIcon className="hidden size-3.5 group-aria-pressed/tag:block" />
                {interest.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ))}
      <ErrorText id={`${id}-error`} message={error} />
    </fieldset>
  );
}

/**
 * A dashed drop target until a flyer is picked, then the flyer itself in
 * the same 5:3 frame the feed uses, with replace and remove.
 */
export function FlyerField({ form }: { form: Form }) {
  const id = useId();
  const url = form.draft.flyerUrl;

  function onFile(file: File | undefined) {
    if (!file) return;
    if (url) URL.revokeObjectURL(url);
    form.set("flyerUrl", URL.createObjectURL(file));
  }

  return (
    <Field>
      <Label htmlFor={id} optional>
        Flyer
      </Label>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="peer sr-only"
        onChange={(event) => onFile(event.target.files?.[0])}
      />
      {url ? (
        <div className="flex items-end gap-4">
          <EventFlyer
            src={url}
            sizes="240px"
            className="aspect-[5/3] w-48 shrink-0 rounded-md ring-1 ring-border"
          />
          <div className="flex gap-2">
            <label
              htmlFor={id}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "cursor-pointer",
              )}
            >
              Replace
            </label>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                URL.revokeObjectURL(url);
                form.set("flyerUrl", null);
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-5 text-sm text-muted-foreground transition-colors peer-focus-visible:border-ring peer-focus-visible:ring-2 peer-focus-visible:ring-ring/30 hover:border-foreground/30 hover:text-foreground"
        >
          <ImageUpIcon className="size-5 shrink-0" />
          <span>
            <span className="font-medium text-foreground">Upload a flyer</span>
            <span className="block">
              PNG or JPG. Wide images (5:3) fill the card best.
            </span>
          </span>
        </label>
      )}
    </Field>
  );
}
