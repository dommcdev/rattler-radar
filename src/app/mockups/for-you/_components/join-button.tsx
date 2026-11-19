"use client";

import { CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuickActivity } from "../../_lib/data";

/** Joined state for one quick activity. Nothing persists. */
export function useJoin(activity: QuickActivity) {
  const [joined, setJoined] = useState(false);
  return {
    joined,
    count: activity.joinedCount + (joined ? 1 : 0),
    toggle: () => setJoined((value) => !value),
  };
}

/** "Join", then "Joined" with a check. Clicking again leaves. */
export function JoinButton({
  joined,
  onToggle,
  title,
  className,
}: {
  joined: boolean;
  onToggle: () => void;
  /** Activity title, for screen readers. */
  title: string;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      size="lg"
      aria-pressed={joined}
      aria-label={joined ? `Joined ${title}. Leave` : `Join ${title}`}
      onClick={onToggle}
      className={cn("min-w-[4.75rem]", className)}
    >
      {joined ? <CheckIcon data-icon="inline-start" /> : null}
      {joined ? "Joined" : "Join"}
    </Button>
  );
}

/** "6 going" */
export function GoingCount({ count }: { count: number }) {
  return (
    <span className="tabular-nums">
      <span className="font-medium text-foreground">{count}</span> going
    </span>
  );
}
