"use client";

import { BellIcon, MailIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { INTEREST_GROUPS } from "../../_lib/data";
import {
  listLabels,
  matchingEvents,
  NEW_STUDENT,
  type OnboardingEvent,
  plural,
} from "./data";
import { BIG_BUTTON, OnboardingDone } from "./shared";

const STEPS = ["Interests", "Notifications"] as const;

/**
 * Variant B: two short steps. First a checklist where every interest says how
 * many upcoming events it has, then email and push alerts (RE-21).
 */
export function StepsOnboarding({ events }: { events: OnboardingEvent[] }) {
  const [step, setStep] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [notifications, setNotifications] = useState({
    email: false,
    push: false,
  });
  const [done, setDone] = useState<{
    interests: string[];
    notifications: { email: boolean; push: boolean };
  } | null>(null);

  function startOver() {
    setDone(null);
    setStep(0);
    setSelected([]);
    setNotifications({ email: false, push: false });
  }

  if (done) {
    return (
      <OnboardingDone
        interests={done.interests}
        notifications={done.notifications}
        matchCount={matchingEvents(events, done.interests).length}
        totalCount={events.length}
        onStartOver={startOver}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-8 pb-12 sm:px-6 sm:pt-12">
        <StepIndicator step={step} />

        {step === 0 ? (
          <InterestsStep
            events={events}
            selected={selected}
            onChange={setSelected}
          />
        ) : (
          <NotificationsStep
            interests={selected}
            value={notifications}
            onChange={setNotifications}
            onBack={() => setStep(0)}
          />
        )}
      </main>

      {/* pb-16 leaves room for the mockup's variant switcher. */}
      <footer className="sticky bottom-0 z-30 border-t bg-background/95 pb-16 backdrop-blur">
        <div className="mx-auto flex max-w-2xl gap-2 px-4 pt-3 sm:px-6">
          {step === 0 ? (
            <>
              <Button
                variant="ghost"
                className={`${BIG_BUTTON} flex-1 sm:flex-none`}
                onClick={() =>
                  setDone({
                    interests: [],
                    notifications: { email: false, push: false },
                  })
                }
              >
                Skip setup
              </Button>
              <Button
                className={`${BIG_BUTTON} flex-1 sm:ml-auto sm:flex-none`}
                onClick={() => setStep(1)}
              >
                {selected.length === 0 ? "Continue" : "Save and continue"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className={`${BIG_BUTTON} flex-1 sm:flex-none`}
                onClick={() => setStep(0)}
              >
                Back
              </Button>
              <Button
                className={`${BIG_BUTTON} flex-1 sm:ml-auto sm:flex-none`}
                onClick={() =>
                  setDone({
                    interests: selected,
                    notifications:
                      selected.length > 0
                        ? notifications
                        : { email: false, push: false },
                  })
                }
              >
                Finish setup
              </Button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

/** Two short bars and a plain "Step 1 of 2". */
function StepIndicator({ step }: { step: 0 | 1 }) {
  return (
    <div className="mb-6">
      <div className="flex gap-1.5" aria-hidden>
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "h-1 w-10 rounded-full bg-border motion-safe:transition-colors",
              index <= step && "bg-foreground",
            )}
          />
        ))}
      </div>
      <p className="mt-2.5 text-sm text-muted-foreground">
        Step {step + 1} of {STEPS.length}:{" "}
        <span className="text-foreground">{STEPS[step]}</span>
      </p>
    </div>
  );
}

function InterestsStep({
  events,
  selected,
  onChange,
}: {
  events: OnboardingEvent[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const matchCount = matchingEvents(events, selected).length;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        What are you into?
      </h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Your home page will show events tagged with what you pick, so you don't
        have to scroll past everything else. Picking nothing is fine too.
      </p>

      <div className="mt-8 space-y-8">
        {INTEREST_GROUPS.map((group) => (
          <fieldset key={group.id}>
            <legend className="text-sm font-medium text-muted-foreground">
              {group.label}
            </legend>
            <ul className="mt-2 grid border-t sm:grid-cols-2 sm:gap-x-8">
              {group.interests.map((interest) => {
                const count = events.filter((event) =>
                  event.interests.includes(interest.id),
                ).length;
                const checked = selected.includes(interest.id);
                return (
                  <li key={interest.id} className="border-b">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Checkbox renders the control inside. */}
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 py-2 hover:bg-muted/40 sm:-mx-2 sm:px-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(on) =>
                          onChange(
                            on
                              ? [...selected, interest.id]
                              : selected.filter((id) => id !== interest.id),
                          )
                        }
                        className="size-5"
                      />
                      <span className="flex-1 text-[15px] font-medium">
                        {interest.label}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {count === 0 ? "None yet" : plural(count, "event")}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {selected.length === 0
          ? `Nothing picked yet, so you'd see all ${events.length} upcoming events.`
          : `${plural(selected.length, "interest")} picked: ${matchCount} of ${events.length} upcoming events match.`}
      </p>
    </>
  );
}

function NotificationsStep({
  interests,
  value,
  onChange,
  onBack,
}: {
  interests: string[];
  value: { email: boolean; push: boolean };
  onChange: (next: { email: boolean; push: boolean }) => void;
  onBack: () => void;
}) {
  const none = interests.length === 0;

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">
        Want a heads-up on new events?
      </h1>
      {none ? (
        <p className="mt-2 max-w-prose text-muted-foreground">
          Alerts are for new events that match your interests, and you didn't
          pick any.{" "}
          <button
            type="button"
            onClick={onBack}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Pick interests
          </button>{" "}
          to turn them on, or finish without them.
        </p>
      ) : (
        <p className="mt-2 max-w-prose text-muted-foreground">
          We'll only tell you about new events tagged {listLabels(interests)}.
          Turn on either, both, or neither.
        </p>
      )}

      <ul className="mt-8 divide-y border-y">
        <NotificationRow
          icon={<MailIcon />}
          title="Email"
          description={`To ${NEW_STUDENT.email}, at most once a day.`}
          checked={!none && value.email}
          disabled={none}
          onChange={(email) => onChange({ ...value, email })}
        />
        <NotificationRow
          icon={<BellIcon />}
          title="Push notifications"
          description="On this device, as soon as an event is posted."
          checked={!none && value.push}
          disabled={none}
          onChange={(push) => onChange({ ...value, push })}
          note={
            value.push && !none
              ? "Your browser will ask to allow notifications when you finish."
              : null
          }
        />
      </ul>
    </>
  );
}

function NotificationRow({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange,
  note,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
  note?: string | null;
}) {
  return (
    <li>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Switch renders the control inside. */}
      <label
        className={cn(
          "flex cursor-pointer items-center gap-4 py-4",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="text-muted-foreground [&_svg]:size-5">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{title}</span>
          <span className="block text-sm text-muted-foreground">
            {description}
          </span>
          {note ? (
            <span className="mt-1 block text-sm text-foreground">{note}</span>
          ) : null}
        </span>
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
          className="mr-1 scale-125"
        />
      </label>
    </li>
  );
}
