"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "~/components/ui/button";
import { cn } from "../lib/utils";

export function MobileModeToggle(props: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
    setCookieTheme(next);
  };

  return (
    <Button
      aria-label="Toggle theme"
      className={cn(props.className)}
      onClick={toggleTheme}
      size="icon"
      variant="ghost"
    >
      <Sun className="h-[0.9rem] w-[0.9rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[0.9rem] w-[0.9rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookieTheme(theme: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: theme preference stored client-side
  document.cookie = `theme=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}`;
}
