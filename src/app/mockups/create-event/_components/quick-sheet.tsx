"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { QuickActivityForm } from "./quick-activity-form";
import { BIG_OUTLINE_BUTTON } from "./styles";

/**
 * Variant C's sheet: slides up from the bottom on phones, and floats as a
 * narrow panel at the bottom of the screen on desktop. Opens on load so
 * the mockup shows it right away.
 */
export function QuickSheet() {
  const [open, setOpen] = useState(true);
  // Remount the form each time the sheet opens, so it starts fresh.
  const [formKey, setFormKey] = useState(0);
  const [isPosted, setIsPosted] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setFormKey((key) => key + 1);
          setIsPosted(false);
        }
      }}
    >
      <SheetTrigger
        render={
          <Button
            variant="outline"
            className={cn(BIG_OUTLINE_BUTTON, "pl-3")}
          />
        }
      >
        <PlusIcon data-icon="inline-start" />
        Post activity
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] overflow-y-auto rounded-t-2xl text-sm motion-reduce:transition-none sm:mx-auto sm:max-h-[calc(100dvh-5rem)] sm:max-w-md sm:rounded-2xl sm:border sm:data-[side=bottom]:bottom-6"
      >
        <div
          aria-hidden
          className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30 sm:hidden"
        />
        <div
          className={cn(
            "space-y-1 px-5 pt-4 pr-12 sm:pt-6",
            // Keep the dialog's name for screen readers after posting.
            isPosted && "sr-only",
          )}
        >
          <SheetTitle className="text-lg font-semibold tracking-tight">
            Post a quick activity
          </SheetTitle>
          <SheetDescription className="text-sm">
            For something happening today. Students on campus can see it and
            show up, no approval needed.
          </SheetDescription>
        </div>
        <QuickActivityForm
          key={formKey}
          className="px-5 pt-6 pb-6"
          onDone={() => setOpen(false)}
          onPostedChange={setIsPosted}
          stickySubmit
        />
      </SheetContent>
    </Sheet>
  );
}
