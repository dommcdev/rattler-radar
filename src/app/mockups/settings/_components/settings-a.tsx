"use client";

import { CheckIcon, InfoIcon } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MockUser } from "../../_lib/data";
import { AccountIdentity, SignOutButton } from "./account-identity";
import { InterestPills } from "./interest-pills";
import { PushBlockedNotice, useMockPushPermission } from "./push-permission";

/**
 * Variant A: one calm page, three sections, every change saves on its own.
 * Each section shows a quiet "Saved" next to its heading for a moment.
 */
export function SettingsA({ user }: { user: MockUser }) {
  const [interests, setInterests] = useState(user.interests);
  const [email, setEmail] = useState(user.notifications.email);
  const [push, setPush] = useState(user.notifications.push);
  const pushPermission = useMockPushPermission("default");
  const interestsSaved = useSavedFlash();
  const notificationsSaved = useSavedFlash();

  function changeInterests(next: string[]) {
    setInterests(next);
    interestsSaved.flash();
  }

  async function changePush(on: boolean) {
    if (!on) {
      setPush(false);
      notificationsSaved.flash();
      return;
    }
    const result = await pushPermission.request();
    if (result === "granted") {
      setPush(true);
      notificationsSaved.flash();
    }
  }

  const blocked = pushPermission.permission === "denied";
  const noInterests = interests.length === 0;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pt-10 pb-28 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Changes save as you go.
      </p>

      <Section
        title="Interests"
        saved={interestsSaved.visible}
        description="We use these to pick events for your For you page and your notifications."
      >
        <InterestPills value={interests} onChange={changeInterests} />
        <div className="mt-5 flex min-h-7 items-center gap-3 text-sm">
          {noInterests ? (
            <p className="flex items-start gap-2 text-muted-foreground">
              <InfoIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                Nothing picked, so you'll see every campus event. Pick a few to
                narrow it down.
              </span>
            </p>
          ) : (
            <>
              <span className="text-muted-foreground tabular-nums">
                {interests.length} picked
              </span>
              <Button
                variant="ghost"
                size="lg"
                className="-ml-1 text-sm text-muted-foreground"
                onClick={() => changeInterests([])}
              >
                Clear all
              </Button>
            </>
          )}
        </div>
      </Section>

      <Section
        title="Notifications"
        saved={notificationsSaved.visible}
        description={
          noInterests
            ? "Since you haven't picked interests, you'd hear about every new event."
            : "Hear about new events that match your interests."
        }
      >
        <div className="divide-y border-y">
          <SwitchRow
            label="Email"
            description={`Sent to ${user.email}`}
            checked={email}
            onCheckedChange={(on) => {
              setEmail(on);
              notificationsSaved.flash();
            }}
          />
          <SwitchRow
            label="Push notifications"
            description={
              pushPermission.asking
                ? "Waiting for your browser. Choose Allow to finish."
                : blocked
                  ? "Blocked by your browser"
                  : "Pops up on this device, even when RattlerRadar is closed."
            }
            checked={push || pushPermission.asking}
            disabled={blocked || pushPermission.asking}
            onCheckedChange={changePush}
          >
            {blocked ? (
              <PushBlockedNotice
                className="mt-3"
                onRecheck={pushPermission.recheck}
              />
            ) : null}
          </SwitchRow>
        </div>
      </Section>

      <Section title="Account">
        <AccountIdentity user={user} />
        <SignOutButton className="mt-6" />
      </Section>

      {pushPermission.prompt}
    </main>
  );
}

function Section({
  title,
  description,
  saved,
  children,
}: {
  title: string;
  description?: string;
  saved?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="mt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {saved !== undefined ? <SavedNote visible={saved} /> : null}
      </div>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
  children,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-6">
        <label htmlFor={id} className="min-w-0">
          <span className="block text-[15px] font-medium">{label}</span>
          <span className="mt-0.5 block text-sm break-words text-muted-foreground">
            {description}
          </span>
        </label>
        <Switch
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
        />
      </div>
      {children}
    </div>
  );
}

/** "Saved" that fades in after a change and out two seconds later. */
function SavedNote({ visible }: { visible: boolean }) {
  return (
    <span
      aria-live="polite"
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground transition-opacity duration-300 motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {visible ? (
        <>
          <CheckIcon aria-hidden className="size-3.5" />
          Saved
        </>
      ) : null}
    </span>
  );
}

function useSavedFlash() {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return {
    visible,
    flash() {
      setVisible(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setVisible(false), 2000);
    },
  };
}
