"use client";

import {
  BellIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { interestLabel, type MockUser } from "../../_lib/data";
import { AccountIdentity, SignOutButton } from "./account-identity";
import { InterestPills } from "./interest-pills";
import { PushBlockedNotice, useMockPushPermission } from "./push-permission";

type PaneId = "profile" | "interests" | "notifications";

const PANES: { id: PaneId; label: string; icon: typeof UserIcon }[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "interests", label: "Interests", icon: TagIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
];

/**
 * Variant B: a sub-nav beside one pane at a time; on phones the nav is a list
 * that opens each pane full width. Each pane is its own small form with one
 * save button, and leaving with unsaved changes asks first. Starts with push
 * blocked by the browser to show that state.
 */
export function SettingsB({ user }: { user: MockUser }) {
  const [active, setActive] = useState<PaneId>("interests");
  // Phones show the list until a pane is opened.
  const [phonePaneOpen, setPhonePaneOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<
    { pane: PaneId } | { back: true } | null
  >(null);

  const [savedInterests, setSavedInterests] = useState(user.interests);
  const [interests, setInterests] = useState(user.interests);
  const [savedNotifications, setSavedNotifications] = useState(
    user.notifications,
  );
  const [notifications, setNotifications] = useState(user.notifications);
  const [justSaved, setJustSaved] = useState<PaneId | null>(null);
  const pushPermission = useMockPushPermission("denied");

  const dirty: Record<PaneId, boolean> = {
    profile: false,
    interests: !sameSet(interests, savedInterests),
    notifications:
      notifications.email !== savedNotifications.email ||
      notifications.push !== savedNotifications.push,
  };

  function go(next: { pane: PaneId } | { back: true }) {
    if ("pane" in next && next.pane === active && phonePaneOpen) return;
    if (dirty[active]) {
      setPendingNav(next);
      return;
    }
    navigate(next);
  }

  function navigate(next: { pane: PaneId } | { back: true }) {
    setJustSaved(null);
    if ("back" in next) {
      setPhonePaneOpen(false);
    } else {
      setActive(next.pane);
      setPhonePaneOpen(true);
    }
  }

  function discardAndGo() {
    setInterests(savedInterests);
    setNotifications(savedNotifications);
    if (pendingNav) navigate(pendingNav);
    setPendingNav(null);
  }

  async function changePush(on: boolean) {
    if (!on) {
      setNotifications((current) => ({ ...current, push: false }));
      return;
    }
    const result = await pushPermission.request();
    if (result === "granted") {
      setNotifications((current) => ({ ...current, push: true }));
    }
  }

  const summaries: Record<PaneId, string> = {
    profile: user.name,
    interests:
      savedInterests.length === 0
        ? "None, showing every event"
        : savedInterests.map(interestLabel).join(", "),
    notifications: [
      `Email ${savedNotifications.email ? "on" : "off"}`,
      pushPermission.permission === "denied"
        ? "push blocked"
        : `push ${savedNotifications.push ? "on" : "off"}`,
    ].join(", "),
  };

  const blocked = pushPermission.permission === "denied";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-10 pb-28 sm:px-6">
      <div className={cn(phonePaneOpen && "max-md:hidden")}>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="md:mt-8 md:grid md:grid-cols-[13rem_1fr] md:gap-12">
        {/* Sub-nav: a list with summaries on phones, a quiet rail on desktop. */}
        <nav
          aria-label="Settings"
          className={cn(
            "mt-6 flex flex-col md:mt-0",
            phonePaneOpen && "max-md:hidden",
          )}
        >
          <ul className="flex flex-col max-md:divide-y max-md:border-y md:gap-0.5">
            {PANES.map((pane) => (
              <li key={pane.id}>
                <button
                  type="button"
                  aria-current={active === pane.id ? "page" : undefined}
                  onClick={() => go({ pane: pane.id })}
                  className="flex w-full items-center gap-3 rounded-md py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 md:px-2.5 md:py-2 md:text-sm md:text-muted-foreground md:hover:bg-muted/60 md:hover:text-foreground md:aria-[current=page]:bg-muted md:aria-[current=page]:font-medium md:aria-[current=page]:text-foreground"
                >
                  <pane.icon
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block max-md:text-[15px] max-md:font-medium">
                      {pane.label}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground md:hidden">
                      {summaries[pane.id]}
                    </span>
                  </span>
                  {dirty[pane.id] ? (
                    <span
                      role="img"
                      aria-label="Unsaved changes"
                      className="size-1.5 shrink-0 rounded-full bg-foreground"
                    />
                  ) : null}
                  <ChevronRightIcon
                    aria-hidden
                    className="size-4 shrink-0 text-muted-foreground md:hidden"
                  />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 md:mt-6 md:border-t md:pt-6">
            <SignOutButton />
          </div>
        </nav>

        <div className={cn("min-w-0", !phonePaneOpen && "max-md:hidden")}>
          <Button
            variant="ghost"
            size="lg"
            className="-ml-2.5 mb-4 text-muted-foreground md:hidden"
            onClick={() => go({ back: true })}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            Settings
          </Button>

          {active === "profile" ? (
            <Pane
              title="Profile"
              description="This comes from your St. Mary's Google account. Change it there and it updates here the next time you sign in."
            >
              <AccountIdentity user={user} />
            </Pane>
          ) : null}

          {active === "interests" ? (
            <Pane
              title="Interests"
              description="Your For you page and notifications only include events tagged with these. Pick none to see everything."
              footer={
                <SaveRow
                  label="Save interests"
                  dirty={dirty.interests}
                  saved={justSaved === "interests"}
                  savedLabel="Interests saved"
                  onSave={() => {
                    setSavedInterests(interests);
                    setJustSaved("interests");
                  }}
                  onDiscard={() => setInterests(savedInterests)}
                />
              }
            >
              <InterestPills
                value={interests}
                onChange={(next) => {
                  setInterests(next);
                  setJustSaved(null);
                }}
              />
              <p
                aria-live="polite"
                className="mt-6 text-sm text-muted-foreground"
              >
                {interests.length === 0 ? (
                  <>
                    <span className="font-medium text-foreground">
                      Showing every event.
                    </span>{" "}
                    With nothing picked, nothing gets filtered out.
                  </>
                ) : (
                  <span className="tabular-nums">
                    {interests.length} picked.{" "}
                    <button
                      type="button"
                      className="underline underline-offset-3 hover:text-foreground"
                      onClick={() => {
                        setInterests([]);
                        setJustSaved(null);
                      }}
                    >
                      Clear to see everything
                    </button>
                  </span>
                )}
              </p>
            </Pane>
          ) : null}

          {active === "notifications" ? (
            <Pane
              title="Notifications"
              description="When a new event matches your interests, we can tell you by email, push, or both."
              footer={
                <SaveRow
                  label="Save notifications"
                  dirty={dirty.notifications}
                  saved={justSaved === "notifications"}
                  savedLabel="Notifications saved"
                  onSave={() => {
                    setSavedNotifications(notifications);
                    setJustSaved("notifications");
                  }}
                  onDiscard={() => setNotifications(savedNotifications)}
                />
              }
            >
              <div className="divide-y border-y">
                <ToggleRow
                  label="Email"
                  description={`To ${user.email}`}
                  checked={notifications.email}
                  onCheckedChange={(on) => {
                    setNotifications((current) => ({ ...current, email: on }));
                    setJustSaved(null);
                  }}
                />
                <ToggleRow
                  label="Push notifications"
                  description={
                    pushPermission.asking
                      ? "Waiting for your browser. Choose Allow to finish."
                      : blocked
                        ? "Off. Your browser is blocking them."
                        : "On this device, even when RattlerRadar is closed."
                  }
                  checked={
                    !blocked && (notifications.push || pushPermission.asking)
                  }
                  disabled={blocked || pushPermission.asking}
                  onCheckedChange={(on) => {
                    changePush(on);
                    setJustSaved(null);
                  }}
                >
                  {blocked ? (
                    <PushBlockedNotice
                      className="mt-3"
                      onRecheck={pushPermission.recheck}
                    />
                  ) : null}
                </ToggleRow>
              </div>
            </Pane>
          ) : null}
        </div>
      </div>

      <AlertDialog
        open={pendingNav !== null}
        onOpenChange={(open) => {
          if (!open) setPendingNav(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You changed your {active} but didn't save. Leaving now puts them
              back the way they were.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={discardAndGo}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {pushPermission.prompt}
    </main>
  );
}

function Pane({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="max-w-xl">
      <h2 id={id} className="text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">
        {description}
      </p>
      <div className="mt-6">{children}</div>
      {footer ? <div className="mt-8">{footer}</div> : null}
    </section>
  );
}

function SaveRow({
  label,
  savedLabel,
  dirty,
  saved,
  onSave,
  onDiscard,
}: {
  label: string;
  savedLabel: string;
  dirty: boolean;
  saved: boolean;
  onSave: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="lg" disabled={!dirty} onClick={onSave}>
        {label}
      </Button>
      {dirty ? (
        <Button variant="ghost" size="lg" onClick={onDiscard}>
          Discard changes
        </Button>
      ) : null}
      <span
        aria-live="polite"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        {saved ? (
          <>
            <CheckIcon aria-hidden className="size-3.5" />
            {savedLabel}
          </>
        ) : null}
      </span>
    </div>
  );
}

function ToggleRow({
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

function sameSet(a: string[], b: string[]) {
  return a.length === b.length && a.every((id) => b.includes(id));
}
