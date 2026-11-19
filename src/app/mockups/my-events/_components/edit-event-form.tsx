"use client";

import { cn } from "cn";
import { type FormEvent, type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  fromInputs,
  MOCK_NOW,
  type MyEvent,
  toDateInput,
  toTimeInput,
} from "./my-events-data";
import type { EventChanges } from "./use-my-events";

/** Inputs here are a size up from the shadcn default; this is a real form. */
export const INPUT_CLASS = "h-9 px-2.5 text-sm md:text-sm";
const LABEL_CLASS = "text-sm";

type Errors = Partial<
  Record<"title" | "date" | "start" | "end" | "location", string>
>;

/**
 * Title, description, date, times, and location. Validates on submit and
 * hands the changes back; the caller decides where the form lives (dialog,
 * sheet, or inline).
 */
export function EditEventForm({
  event,
  onSave,
  onDiscard,
  className,
  bodyClassName,
  footerClassName,
  footerStart,
}: {
  event: MyEvent;
  onSave: (changes: EventChanges) => void;
  onDiscard: () => void;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  /** Goes at the start of the button row, e.g. a "Cancel event" button. */
  footerStart?: ReactNode;
}) {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const data = new FormData(submitEvent.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const title = value("title");
    const date = value("date");
    const start = value("start");
    const end = value("end");
    const location = value("location");

    const next: Errors = {};
    if (!title) next.title = "Add a title so students know what this is.";
    if (!date) next.date = "Pick a date.";
    else if (date < toDateInput(MOCK_NOW.toISOString()))
      next.date = "That date has passed. Pick today or later.";
    if (!start) next.start = "Add a start time.";
    if (start && end && end <= start)
      next.end = "End time has to be after the start time.";
    if (!location)
      next.location = "Add a room or address so people can find it.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      title,
      description: value("description"),
      startsAt: fromInputs(date, start),
      endsAt: end ? fromInputs(date, end) : null,
      location,
    });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn("flex flex-col", className)}
    >
      <FieldGroup className={cn("gap-5", bodyClassName)}>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor={`${id}-title`} className={LABEL_CLASS}>
            Title
          </FieldLabel>
          <Input
            id={`${id}-title`}
            name="title"
            defaultValue={event.title}
            aria-invalid={!!errors.title}
            className={INPUT_CLASS}
          />
          <FieldError>{errors.title}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor={`${id}-description`} className={LABEL_CLASS}>
            Description
          </FieldLabel>
          <Textarea
            id={`${id}-description`}
            name="description"
            defaultValue={event.description}
            rows={4}
            className="min-h-24 px-2.5 text-sm md:text-sm"
          />
        </Field>

        <Field data-invalid={!!errors.date}>
          <FieldLabel htmlFor={`${id}-date`} className={LABEL_CLASS}>
            Date
          </FieldLabel>
          <Input
            id={`${id}-date`}
            name="date"
            type="date"
            defaultValue={toDateInput(event.startsAt)}
            aria-invalid={!!errors.date}
            className={INPUT_CLASS}
          />
          <FieldError>{errors.date}</FieldError>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field data-invalid={!!errors.start}>
            <FieldLabel htmlFor={`${id}-start`} className={LABEL_CLASS}>
              Starts
            </FieldLabel>
            <Input
              id={`${id}-start`}
              name="start"
              type="time"
              defaultValue={toTimeInput(event.startsAt)}
              aria-invalid={!!errors.start}
              className={INPUT_CLASS}
            />
            <FieldError>{errors.start}</FieldError>
          </Field>
          <Field data-invalid={!!errors.end}>
            <FieldLabel htmlFor={`${id}-end`} className={LABEL_CLASS}>
              Ends
            </FieldLabel>
            <Input
              id={`${id}-end`}
              name="end"
              type="time"
              defaultValue={toTimeInput(event.endsAt)}
              aria-invalid={!!errors.end}
              className={INPUT_CLASS}
            />
            <FieldError>{errors.end}</FieldError>
          </Field>
        </div>

        <Field data-invalid={!!errors.location}>
          <FieldLabel htmlFor={`${id}-location`} className={LABEL_CLASS}>
            Location
          </FieldLabel>
          <Input
            id={`${id}-location`}
            name="location"
            defaultValue={event.location}
            aria-invalid={!!errors.location}
            className={INPUT_CLASS}
          />
          <FieldError>{errors.location}</FieldError>
          {errors.location ? null : (
            <FieldDescription>
              Building and room, or an address.
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>

      <div
        className={cn(
          "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
          footerClassName,
        )}
      >
        {footerStart ? (
          <div className="mt-2 sm:mt-0 sm:mr-auto">{footerStart}</div>
        ) : null}
        <Button type="button" variant="outline" size="lg" onClick={onDiscard}>
          Discard changes
        </Button>
        <Button type="submit" size="lg">
          Save changes
        </Button>
      </div>
    </form>
  );
}
