"use client";

import {
  ChevronsUpDown,
  Home,
  LogOut,
  MessageCircleQuestion,
  Shield,
} from "lucide-react";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "~/components/lib/utils";
import { If } from "~/components/makerkit/if";
import { SubMenuModeToggle } from "~/components/makerkit/mode-toggle";
import { ProfileAvatar } from "~/components/makerkit/profile-avatar";
import { Trans } from "~/components/makerkit/trans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";

import { usePersonalAccountData } from "../hooks/use-personal-account-data";

export function PersonalAccountDropdown({
  className,
  user,
  signOutRequested,
  showProfileName = true,
  paths,
  features,
  account,
}: {
  user: BetterAuthUser;

  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };

  signOutRequested: () => unknown;

  paths: {
    home: string;
  };

  features: {
    enableThemeToggle: boolean;
  };

  showProfileName?: boolean;

  className?: string;
}) {
  const { data: personalAccountData } = usePersonalAccountData(
    user.id,
    account
  );

  const signedInAsLabel = useMemo(() => user?.email ?? undefined, [user]);

  const displayName =
    personalAccountData?.name ?? account?.name ?? user?.email ?? "";

  // Super admin check is handled server-side via isSuperAdmin()
  // For client-side, we'll default to false and let server components handle it
  const isSuperAdmin = false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        className={cn(
          "group/trigger fade-in flex animate-in cursor-pointer items-center focus:outline-primary group-data-[minimized=true]/sidebar:px-0",
          className ?? "",
          {
            ["items-center gap-4 rounded-md active:bg-secondary/50" +
              "border border-dashed p-2 transition-colors hover:bg-secondary"]:
              showProfileName,
          }
        )}
        data-test={"account-dropdown-trigger"}
      >
        <ProfileAvatar
          className={
            "rounded-md border border-transparent transition-colors group-hover/trigger:border-background/50"
          }
          displayName={displayName ?? user?.email ?? ""}
          fallbackClassName={"rounded-md border"}
          pictureUrl={personalAccountData?.picture_url}
        />

        <If condition={showProfileName}>
          <div
            className={
              "fade-in flex w-full animate-in flex-col truncate text-left group-data-[minimized=true]/sidebar:hidden"
            }
          >
            <span
              className={"truncate text-sm"}
              data-test={"account-dropdown-display-name"}
            >
              {displayName}
            </span>

            <span
              className={"truncate text-muted-foreground text-xs"}
              data-test={"account-dropdown-email"}
            >
              {signedInAsLabel}
            </span>
          </div>

          <ChevronsUpDown
            className={
              "mr-1 h-8 text-muted-foreground group-data-[minimized=true]/sidebar:hidden"
            }
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={"xl:min-w-[15rem]!"}>
        <DropdownMenuItem
          className={
            "pointer-events-none h-10! rounded-none focus:bg-transparent focus:text-inherit"
          }
        >
          <div
            className={"flex flex-col justify-start truncate text-left text-xs"}
          >
            <div className={"text-muted-foreground"}>
              <Trans i18nKey={"common:signedInAs"} />
            </div>

            <div>
              <span className={"block truncate"}>{signedInAsLabel}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={"s-full flex cursor-pointer items-center space-x-2"}
            href={paths.home}
          >
            <Home className={"h-5"} />

            <span>
              <Trans i18nKey={"common:routes.home"} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={"s-full flex cursor-pointer items-center space-x-2"}
            href={"/docs"}
          >
            <MessageCircleQuestion className={"h-5"} />

            <span>
              <Trans i18nKey={"common:documentation"} />
            </span>
          </Link>
        </DropdownMenuItem>

        <If condition={isSuperAdmin}>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              className={
                "s-full flex cursor-pointer items-center space-x-2 text-yellow-700 dark:text-yellow-500"
              }
              href={"/admin"}
            >
              <Shield className={"h-5"} />

              <span>Super Admin</span>
            </Link>
          </DropdownMenuItem>
        </If>

        <DropdownMenuSeparator />

        <If condition={features.enableThemeToggle}>
          <SubMenuModeToggle />
        </If>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={"cursor-pointer"}
          data-test={"account-dropdown-sign-out"}
          onClick={signOutRequested}
          role={"button"}
        >
          <span className={"flex w-full items-center space-x-2"}>
            <LogOut className={"h-5"} />

            <span>
              <Trans i18nKey={"auth:signOut"} />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
