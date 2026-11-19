"use client";

import { useRef, useState } from "react";
import {
  type DraftErrors,
  type DraftField,
  EMPTY_DRAFT,
  type EventDraft,
  firstError,
  validateDraft,
} from "./draft";

/**
 * Form state for a club event. Errors only show after the first publish
 * attempt, then update as the leader fixes things. Nothing the leader
 * typed is ever cleared by a failed submit.
 */
export function useEventDraft(initial: EventDraft = EMPTY_DRAFT) {
  const [draft, setDraft] = useState(initial);
  const [hasTried, setHasTried] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const fieldRefs = useRef<Partial<Record<DraftField, HTMLElement | null>>>({});

  const errors: DraftErrors = hasTried ? validateDraft(draft) : {};
  const errorCount = Object.keys(errors).length;

  function set<K extends DraftField>(field: K, value: EventDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  /** Attach to a field's focus target so errors can move focus to it. */
  function register(field: DraftField) {
    return (element: HTMLElement | null) => {
      fieldRefs.current[field] = element;
    };
  }

  function focusField(field: DraftField) {
    const element = fieldRefs.current[field];
    if (!element) return;
    // Groups (like the tag picker) focus their first control.
    const target = element.matches("input, textarea, button, select")
      ? element
      : element.querySelector<HTMLElement>("input, textarea, button");
    target?.focus();
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  /** Returns true when the draft published. */
  function publish(): boolean {
    setHasTried(true);
    const first = firstError(validateDraft(draft));
    if (first) {
      focusField(first);
      return false;
    }
    setIsPublished(true);
    return true;
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setHasTried(false);
    setIsPublished(false);
  }

  return {
    draft,
    errors,
    errorCount,
    isPublished,
    set,
    register,
    publish,
    reset,
  };
}
