"use client";

import { CheckIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Toggle } from "@/components/ui/toggle";
import { saveOnboardingInterests } from "@/lib/interest-actions";
import { INTEREST_GROUPS } from "@/lib/interests";
import { cn } from "@/lib/utils";

/** Bigger than the app's default buttons, for thumbs. */
const BIG_BUTTON = "h-10 px-4 text-sm sm:h-9";

/**
 * Onboarding's one screen: interest pills grouped by category, with a sticky
 * footer holding the save button so it's always in reach.
 */
export function InterestPicker({
  firstName,
  initialInterests,
  returnTo,
}: {
  firstName: string;
  initialInterests: string[];
  returnTo: string;
}) {
  const [selected, setSelected] = useState(initialInterests);
  const [isPending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function toggle(id: string, on: boolean) {
    setSelected((current) =>
      on ? [...current, id] : current.filter((item) => item !== id),
    );
  }

  function save() {
    setFailed(false);
    startTransition(async () => {
      try {
        // Redirects on success.
        await saveOnboardingInterests(selected, returnTo);
      } catch {
        setFailed(true);
      }
    });
  }

  return (
    // Fills the screen so the footer sits at the bottom even on tall screens.
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-10 pb-12 sm:px-6 sm:pt-14">
        <h1 className="text-2xl font-semibold tracking-tight">
          {firstName
            ? `What are you into, ${firstName}?`
            : "What are you into?"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pick a few. You can change these anytime.
        </p>

        <div className="mt-10 space-y-9">
          {INTEREST_GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
                className="text-sm font-medium text-muted-foreground"
              >
                {group.label}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.interests.map((interest) => (
                  <InterestPill
                    key={interest.id}
                    label={interest.label}
                    pressed={selected.includes(interest.id)}
                    onPressedChange={(on) => toggle(interest.id, on)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="sticky bottom-0 z-30 border-t bg-background/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 pt-3 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          {failed ? (
            <FieldError className="sm:mr-auto">
              Couldn't save your interests. Check your connection and try again.
            </FieldError>
          ) : null}
          <div className="flex gap-2">
            {selected.length > 0 ? (
              <Link
                href={returnTo}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  BIG_BUTTON,
                  "flex-1 sm:flex-none",
                )}
              >
                Skip for now
              </Link>
            ) : null}
            <Button
              className={cn(BIG_BUTTON, "flex-1 sm:flex-none")}
              onClick={save}
              disabled={isPending}
            >
              {isPending ? <Spinner /> : null}
              {selected.length === 0
                ? "Continue with all events"
                : `Save ${selected.length} ${selected.length === 1 ? "interest" : "interests"}`}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * An interest as a pill toggle. Selected pills invert (solid foreground), so
 * the picked set reads at a glance without spending the navy primary.
 */
function InterestPill({
  label,
  pressed,
  onPressedChange,
}: {
  label: string;
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}) {
  return (
    <Toggle
      pressed={pressed}
      onPressedChange={onPressedChange}
      className={cn(
        "h-10 gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted sm:h-9",
        "aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/85 aria-pressed:hover:text-background",
      )}
    >
      {pressed ? (
        <CheckIcon className="-ml-1 size-4" />
      ) : (
        <PlusIcon className="-ml-1 size-4 text-muted-foreground" />
      )}
      {label}
    </Toggle>
  );
}
