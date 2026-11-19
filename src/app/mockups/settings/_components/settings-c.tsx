"use client";

import { BellOffIcon, CheckIcon } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { INTEREST_GROUPS, type MockUser } from "../../_lib/data";
import { AccountIdentity, SignOutButton } from "./account-identity";
import { PushBlockedNotice, useMockPushPermission } from "./push-permission";

type Mode = "all" | "matching";
type Channel = "email" | "push";
type Topic = "newEvents" | "reminders";

interface Draft {
  mode: Mode;
  interests: string[];
  notify: Record<Topic, Record<Channel, boolean>>;
}

/**
 * Variant C: one form with a single save bar. "Show everything" is an explicit
 * choice instead of an empty selection, and notifications are a small grid of
 * what (rows) by how (columns).
 */
export function SettingsC({ user }: { user: MockUser }) {
  const initial: Draft = {
    mode: user.interests.length ? "matching" : "all",
    interests: user.interests,
    notify: {
      newEvents: { ...user.notifications },
      reminders: { email: false, push: false },
    },
  };
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushPermission = useMockPushPermission("default");
  const interestsRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const blocked = pushPermission.permission === "denied";
  const missingInterests =
    draft.mode === "matching" && draft.interests.length === 0;

  function update(next: Draft) {
    setDraft(next);
    setSavedFlash(false);
    if (error && !(next.mode === "matching" && next.interests.length === 0)) {
      setError(false);
    }
  }

  async function setCell(topic: Topic, channel: Channel, on: boolean) {
    if (channel === "push" && on) {
      const result = await pushPermission.request();
      if (result !== "granted") return;
    }
    setDraft((current) => ({
      ...current,
      notify: {
        ...current.notify,
        [topic]: { ...current.notify[topic], [channel]: on },
      },
    }));
    setSavedFlash(false);
  }

  function save() {
    if (missingInterests) {
      setError(true);
      interestsRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
      return;
    }
    setSaved(draft);
    setSavedFlash(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-44 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Section
        title="Your events"
        description="What shows up on your For you page and in notifications."
      >
        <RadioGroup
          value={draft.mode}
          onValueChange={(value) => update({ ...draft, mode: value as Mode })}
          aria-label="Which events to show"
          className="gap-0 divide-y border-y"
        >
          <RadioRow
            value="all"
            label="Every campus event"
            description="Nothing filtered out."
          />
          <RadioRow
            value="matching"
            label="Only events that match my interests"
            description="Pick as many as you like."
          >
            {draft.mode === "matching" ? (
              <div ref={interestsRef} className="scroll-mt-24 pt-1 pb-2 pl-7">
                {error && missingInterests ? (
                  <p role="alert" className="mb-4 text-sm text-destructive">
                    Pick at least one interest, or choose Every campus event.
                  </p>
                ) : null}
                <div className="grid gap-6 sm:grid-cols-2">
                  {INTEREST_GROUPS.map((group) => (
                    <fieldset key={group.id}>
                      <legend className="text-sm font-medium text-muted-foreground">
                        {group.label}
                      </legend>
                      <div className="mt-2 flex flex-col">
                        {group.interests.map((interest) => (
                          <InterestCheckbox
                            key={interest.id}
                            label={interest.label}
                            checked={draft.interests.includes(interest.id)}
                            onCheckedChange={(on) =>
                              update({
                                ...draft,
                                interests: on
                                  ? [...draft.interests, interest.id]
                                  : draft.interests.filter(
                                      (id) => id !== interest.id,
                                    ),
                              })
                            }
                          />
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>
            ) : null}
          </RadioRow>
        </RadioGroup>
      </Section>

      <Section
        title="Notifications"
        description="Choose what we tell you about and how."
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">
                <span className="sr-only">Notification</span>
              </th>
              <th scope="col" className="w-16 py-2 text-center font-medium">
                Email
              </th>
              <th scope="col" className="w-16 py-2 text-center font-medium">
                <span className="inline-flex items-center gap-1">
                  Push
                  {blocked ? (
                    <BellOffIcon
                      role="img"
                      aria-label="blocked"
                      className="size-3.5"
                    />
                  ) : null}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y border-b">
            <MatrixRow
              label={
                draft.mode === "all"
                  ? "Any new event is posted"
                  : "A new event matches my interests"
              }
              values={draft.notify.newEvents}
              blocked={blocked}
              onChange={(channel, on) => setCell("newEvents", channel, on)}
            />
            <MatrixRow
              label="Reminder the day before an event I RSVP'd to"
              tag={<Badge variant="outline">Optional scope</Badge>}
              values={draft.notify.reminders}
              blocked={blocked}
              onChange={(channel, on) => setCell("reminders", channel, on)}
            />
          </tbody>
        </table>
        <p className="mt-3 text-sm break-words text-muted-foreground">
          {pushPermission.asking
            ? "Waiting for your browser. Choose Allow to turn on push."
            : `Emails go to ${user.email}. Push goes to this device.`}
        </p>
        {blocked ? (
          <PushBlockedNotice
            className="mt-4"
            onRecheck={pushPermission.recheck}
          />
        ) : null}
      </Section>

      <Section title="Account">
        <AccountIdentity user={user} />
        <SignOutButton className="mt-6" />
      </Section>

      <SaveBar
        visible={dirty || savedFlash}
        dirty={dirty}
        error={error && missingInterests}
        onDiscard={() => {
          setDraft(saved);
          setError(false);
        }}
        onSave={save}
      />

      {pushPermission.prompt}
    </main>
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
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-12">
      <h2 id={id} className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function RadioRow({
  value,
  label,
  description,
  children,
}: {
  value: string;
  label: string;
  description: string;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 py-4"
      >
        <RadioGroupItem id={id} value={value} className="mt-0.5" />
        <span className="min-w-0">
          <span className="block text-[15px] font-medium">{label}</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {description}
          </span>
        </span>
      </label>
      {children}
    </div>
  );
}

function InterestCheckbox({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 py-1.5 text-[15px]"
    >
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );
}

function MatrixRow({
  label,
  tag,
  values,
  blocked,
  onChange,
}: {
  label: string;
  tag?: ReactNode;
  values: Record<Channel, boolean>;
  blocked: boolean;
  onChange: (channel: Channel, on: boolean) => void;
}) {
  return (
    <tr>
      <th scope="row" className="py-4 pr-4 text-[15px] font-medium">
        <span>{label}</span>
        {tag ? <span className="mt-1.5 block">{tag}</span> : null}
      </th>
      {(["email", "push"] as const).map((channel) => (
        <td key={channel} className="py-4 text-center align-middle">
          <Checkbox
            aria-label={`${label}: ${channel}`}
            checked={channel === "push" && blocked ? false : values[channel]}
            disabled={channel === "push" && blocked}
            onCheckedChange={(on) => onChange(channel, on)}
            className="mx-auto size-5 [&_svg]:size-4"
          />
        </td>
      ))}
    </tr>
  );
}

function SaveBar({
  visible,
  dirty,
  error,
  onDiscard,
  onSave,
}: {
  visible: boolean;
  dirty: boolean;
  error: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-40 px-4 transition-[opacity,translate] duration-200 motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-lg border bg-background py-2 pr-2 pl-4 shadow-lg">
        <p aria-live="polite" className="min-w-0 flex-1 text-sm">
          {dirty ? (
            error ? (
              <span className="text-destructive">Pick an interest first</span>
            ) : (
              "Unsaved changes"
            )
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <CheckIcon aria-hidden className="size-3.5" />
              Settings saved
            </span>
          )}
        </p>
        {dirty ? (
          <>
            <Button variant="ghost" size="lg" onClick={onDiscard}>
              Discard
            </Button>
            <Button size="lg" onClick={onSave}>
              Save changes
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
