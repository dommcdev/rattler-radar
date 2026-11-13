"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Both icons render and CSS shows the right one, so the server-rendered
  // HTML is correct before the theme is known on the client.
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch between light and dark mode"
    >
      <HugeiconsIcon icon={Sun03Icon} className="hidden dark:block" />
      <HugeiconsIcon icon={Moon02Icon} className="dark:hidden" />
    </Button>
  );
}
