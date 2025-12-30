"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { Trans } from "~/components/trans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSignOut } from "~/hooks/use-sign-out";
import pathsConfig from "~/lib/config/paths.config";
import { personalAccountNavigationConfig } from "~/lib/config/personal-account-navigation.config";

import type { UserWorkspace } from "../_lib/server/load-user-workspace";

export function HomeMobileNavigation(_props: { workspace: UserWorkspace }) {
  const signOut = useSignOut();

  const Links = personalAccountNavigationConfig.routes.flatMap(
    (item, index) => {
      if ("children" in item) {
        return item.children.map((child) => (
          <DropdownLink
            Icon={child.Icon}
            key={child.path}
            label={child.label}
            path={child.path}
          />
        ));
      }

      if ("divider" in item) {
        return (
          <DropdownMenuSeparator
            key={`divider-${"label" in item ? item.label : index}`}
          />
        );
      }

      return [];
    }
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={"h-9"} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className={"w-screen rounded-none"} sideOffset={10}>
        <DropdownMenuGroup>{Links}</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <SignOutDropdownItem onSignOut={() => signOut.mutateAsync()} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        className={"flex h-12 w-full items-center space-x-4"}
        href={props.path}
      >
        {props.Icon}

        <span>
          <Trans defaults={props.label} i18nKey={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>
) {
  const handleSignOut = async () => {
    try {
      await props.onSignOut();
      // Redirect to home page after successful sign out
      window.location.href = pathsConfig.app.home;
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <DropdownMenuItem
      className={"flex h-12 w-full items-center space-x-4"}
      onClick={handleSignOut}
    >
      <LogOut className={"h-6"} />

      <span>
        <Trans defaults={"Sign out"} i18nKey={"common:signOut"} />
      </span>
    </DropdownMenuItem>
  );
}
