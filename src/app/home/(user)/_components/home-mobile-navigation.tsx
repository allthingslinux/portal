"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import featuresFlagConfig from "~/config/feature-flags.config";
import { personalAccountNavigationConfig } from "~/config/personal-account-navigation.config";
import { useSignOut } from "~/core/auth/better-auth/hooks";

// home imports
import { HomeAccountSelector } from "../_components/home-account-selector";
import type { UserWorkspace } from "../_lib/server/load-user-workspace";

export function HomeMobileNavigation(props: { workspace: UserWorkspace }) {
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
        <If condition={featuresFlagConfig.enableTeamAccounts}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <Trans i18nKey={"common:yourAccounts"} />
            </DropdownMenuLabel>

            <HomeAccountSelector
              accounts={props.workspace.accounts}
              collisionPadding={0}
              userId={props.workspace.user.id}
            />
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
        </If>

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
  return (
    <DropdownMenuItem
      className={"flex h-12 w-full items-center space-x-4"}
      onClick={props.onSignOut}
    >
      <LogOut className={"h-6"} />

      <span>
        <Trans defaults={"Sign out"} i18nKey={"common:signOut"} />
      </span>
    </DropdownMenuItem>
  );
}
