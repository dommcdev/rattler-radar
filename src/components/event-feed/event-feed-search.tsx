"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useEventFeed } from "./event-feed-context";

/** Search box. Press "/" anywhere on the page to jump to it. */
export function EventFeedSearch({ className }: { className?: string }) {
  const {
    state: { query },
    actions: { setQuery },
  } = useEventFeed();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function focusOnSlash(event: KeyboardEvent) {
      if (event.key !== "/" || isTyping(event.target)) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", focusOnSlash);
    return () => document.removeEventListener("keydown", focusOnSlash);
  }, []);

  return (
    <InputGroup className={cn("h-8", className)}>
      <InputGroupAddon>
        <HugeiconsIcon icon={Search01Icon} />
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search events, clubs, or places"
        aria-label="Search events"
        className="text-sm md:text-sm"
      />
      <InputGroupAddon align="inline-end" className="hidden sm:flex">
        <Kbd>/</Kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}
