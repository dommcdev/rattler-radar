"use client";

import { useState } from "react";
import type { FeedEvent } from "@/lib/events/feed-event";

type Host = FeedEvent["hosts"][number];

const TOGGLE_CLASS =
  "text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground";

/**
 * "Hosted by Rotaract", "Hosted by Rotaract and IEEE", or for big
 * collaborations "Hosted by Rotaract and 8 others", where "8 others" spells
 * out the rest in place (with a "Show less" to fold them back up).
 */
export function EventHosts({ hosts }: { hosts: Host[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [first, ...others] = hosts;
  if (!first) return null;

  return (
    <p className="mt-1.5 text-muted-foreground">
      Hosted by <HostName host={first} />
      {others.length === 0 ? null : others.length === 1 ? (
        <>
          {" and "}
          <HostName host={others[0]} />
        </>
      ) : isExpanded ? (
        <>
          {others.map((host, index) => (
            <span key={host.id}>
              {index === others.length - 1 ? ", and " : ", "}
              <HostName host={host} />
            </span>
          ))}{" "}
          <button
            type="button"
            aria-expanded
            onClick={() => setIsExpanded(false)}
            className={`text-sm ${TOGGLE_CLASS}`}
          >
            Show less
          </button>
        </>
      ) : (
        <>
          {" and "}
          <button
            type="button"
            aria-expanded={false}
            onClick={() => setIsExpanded(true)}
            className={TOGGLE_CLASS}
          >
            {others.length} others
          </button>
        </>
      )}
    </p>
  );
}

/** One host's name. Becomes a link once hosts have their own pages. */
function HostName({ host }: { host: Host }) {
  return <span className="text-foreground">{host.name}</span>;
}
