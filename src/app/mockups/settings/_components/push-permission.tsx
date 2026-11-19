"use client";

import { BellIcon, LockIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Mirrors `Notification.permission`. */
export type PushPermission = "default" | "granted" | "denied";

/**
 * Fakes the browser's notification permission so the mockups can show every
 * state. `request()` opens a pretend browser prompt (render `prompt`) and
 * resolves with what the student clicked, like `Notification.requestPermission`.
 */
export function useMockPushPermission(initial: PushPermission) {
  const [permission, setPermission] = useState<PushPermission>(initial);
  const [asking, setAsking] = useState(false);
  const resolver = useRef<((result: PushPermission) => void) | null>(null);

  function request(): Promise<PushPermission> {
    if (permission !== "default") return Promise.resolve(permission);
    setAsking(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }

  function answer(result: "granted" | "denied") {
    setAsking(false);
    setPermission(result);
    resolver.current?.(result);
    resolver.current = null;
  }

  const prompt = asking ? <MockBrowserPrompt onAnswer={answer} /> : null;

  return {
    permission,
    asking,
    request,
    prompt,
    /** What "Check again" does once the student fixed it in the browser. */
    recheck: () => setPermission("granted"),
  };
}

/** Stand-in for Chrome's permission bubble under the address bar. */
function MockBrowserPrompt({
  onAnswer,
}: {
  onAnswer: (result: "granted" | "denied") => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Simulated browser permission prompt"
      className="fixed top-2 left-2 z-[60] w-[19rem] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl"
    >
      <p className="text-[11px] text-muted-foreground">
        Simulated browser prompt
      </p>
      <p className="mt-2 text-sm">rattlerradar.stmarytx.edu wants to</p>
      <p className="mt-2 flex items-center gap-2 text-sm">
        <BellIcon aria-hidden className="size-4 text-muted-foreground" />
        Show notifications
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="lg" onClick={() => onAnswer("denied")}>
          Block
        </Button>
        <Button variant="outline" size="lg" onClick={() => onAnswer("granted")}>
          Allow
        </Button>
      </div>
    </div>
  );
}

/**
 * Shown when the browser has blocked notifications. Only the student can undo
 * that, in the browser's own settings, so say exactly where to look.
 */
export function PushBlockedNotice({
  onRecheck,
  className,
}: {
  onRecheck: () => void;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-muted/60 p-4 text-sm", className)}>
      <p className="font-medium">Your browser is blocking notifications</p>
      <p className="mt-1 text-muted-foreground">
        RattlerRadar can't turn push back on by itself. You'll need to allow it
        in your browser, then come back here.
      </p>
      <ol className="mt-3 hidden list-decimal flex-col gap-1 pl-5 text-muted-foreground marker:text-muted-foreground sm:flex">
        <li>
          Click the{" "}
          <LockIcon aria-hidden className="inline size-3.5 align-[-2px]" /> icon
          at the left of the address bar.
        </li>
        <li>
          Set <span className="text-foreground">Notifications</span> to{" "}
          <span className="text-foreground">Allow</span>.
        </li>
        <li>Choose Check again below.</li>
      </ol>
      <div className="mt-3 flex flex-col gap-2 text-muted-foreground sm:hidden">
        <p>
          <span className="text-foreground">iPhone:</span> push only works if
          you add RattlerRadar to your Home Screen (Share, then Add to Home
          Screen) and open it from there.
        </p>
        <p>
          <span className="text-foreground">Android:</span> tap the icon left of
          the address bar, then Permissions, then turn on Notifications.
        </p>
      </div>
      <Button variant="outline" size="lg" className="mt-4" onClick={onRecheck}>
        Check again
      </Button>
    </div>
  );
}
