"use client";

import { Computer, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "../lib/utils";
import { Trans } from "./trans";

const MODES = ["light", "dark", "system"];

export function ModeToggle(props: { className?: string }) {
  const { setTheme, theme } = useTheme();

  const Items = useMemo(
    () =>
      MODES.map((mode) => {
        const isSelected = theme === mode;

        return (
          <DropdownMenuItem
            className={cn("space-x-2", {
              "bg-secondary": isSelected,
            })}
            key={mode}
            onClick={() => {
              setTheme(mode);
              setCookieTheme(mode);
            }}
          >
            <Icon theme={mode} />

            <span>
              <Trans i18nKey={`common:${mode}Theme`} />
            </span>
          </DropdownMenuItem>
        );
      }),
    [setTheme, theme]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={props.className} size="icon" variant="ghost">
          <Sun className="h-[0.9rem] w-[0.9rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[0.9rem] w-[0.9rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">{Items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SubMenuModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const MenuItems = useMemo(
    () =>
      MODES.map((mode) => {
        const isSelected = theme === mode;

        return (
          <DropdownMenuItem
            className={cn("flex cursor-pointer items-center space-x-2", {
              "bg-secondary": isSelected,
            })}
            key={mode}
            onClick={() => {
              setTheme(mode);
              setCookieTheme(mode);
            }}
          >
            <Icon theme={mode} />

            <span>
              <Trans i18nKey={`common:${mode}Theme`} />
            </span>
          </DropdownMenuItem>
        );
      }),
    [setTheme, theme]
  );

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          className={
            "hidden w-full items-center justify-between gap-x-3 lg:flex"
          }
        >
          <span className={"flex space-x-2"}>
            <Icon theme={resolvedTheme} />

            <span>
              <Trans i18nKey={"common:theme"} />
            </span>
          </span>
        </DropdownMenuSubTrigger>

        <DropdownMenuSubContent>{MenuItems}</DropdownMenuSubContent>
      </DropdownMenuSub>

      <div className={"lg:hidden"}>
        <DropdownMenuLabel>
          <Trans i18nKey={"common:theme"} />
        </DropdownMenuLabel>

        {MenuItems}
      </div>
    </>
  );
}

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookieTheme(theme: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: theme preference stored client-side
  document.cookie = `theme=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}`;
}

function Icon({ theme }: { theme: string | undefined }) {
  switch (theme) {
    case "light":
      return <Sun className="h-4" />;
    case "dark":
      return <Moon className="h-4" />;
    case "system":
      return <Computer className="h-4" />;
    default:
      return <Computer className="h-4" />;
  }
}
