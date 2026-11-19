"use client";

import { CheckIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { INTEREST_GROUPS } from "../../_lib/data";

/**
 * Every interest as a pill, grouped like onboarding. Same look as the feed's
 * filter pills, a little taller for thumbs, with a check on picked ones.
 */
export function InterestPills({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {INTEREST_GROUPS.map((group) => {
        const groupIds = group.interests.map((interest) => interest.id);
        const picked = value.filter((id) => groupIds.includes(id));
        return (
          <div key={group.id} className="flex flex-col gap-2.5">
            <h3
              id={`interest-group-${group.id}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {group.label}
            </h3>
            <ToggleGroup
              multiple
              variant="outline"
              spacing={1.5}
              value={picked}
              onValueChange={(next) =>
                onChange([
                  ...value.filter((id) => !groupIds.includes(id)),
                  ...next,
                ])
              }
              aria-labelledby={`interest-group-${group.id}`}
              className="flex-wrap"
            >
              {group.interests.map((interest) => (
                <ToggleGroupItem
                  key={interest.id}
                  value={interest.id}
                  className="group/pill h-8 rounded-full px-3 text-sm font-normal text-muted-foreground aria-pressed:border-foreground/30 aria-pressed:bg-muted aria-pressed:pl-2.5 aria-pressed:text-foreground"
                >
                  <CheckIcon
                    aria-hidden
                    className="hidden size-3.5 group-aria-pressed/pill:block"
                  />
                  {interest.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        );
      })}
    </div>
  );
}
