"use client";

import { Home, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trans } from "~/components/portal/trans";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import featureFlagsConfig from "~/config/feature-flags.config";
import pathsConfig from "~/config/paths.config";
import { getTeamAccountSidebarConfig } from "~/config/team-account-navigation.config";
import { useSignOut } from "~/core/auth/better-auth/hooks";
import { AccountSelector } from "~/features/accounts/components/account-selector";

type Accounts = Array<{
  label: string | null;
  value: string | null;
  image: string | null;
}>;

const features = {
  enableTeamAccounts: featureFlagsConfig.enableTeamAccounts,
  enableTeamCreation: featureFlagsConfig.enableTeamCreation,
};

export const TeamAccountLayoutMobileNavigation = (
  props: React.PropsWithChildren<{
    account: string;
    userId: string;
    accounts: Accounts;
  }>
) => {
  const signOut = useSignOut();

  const Links = getTeamAccountSidebarConfig(props.account).routes.flatMap(
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
        <TeamAccountsModal
          account={props.account}
          accounts={props.accounts}
          userId={props.userId}
        />

        {Links}

        <DropdownMenuSeparator />

        <SignOutDropdownItem onSignOut={() => signOut.mutateAsync()} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>
) {
  return (
    <DropdownMenuItem asChild>
      <Link
        className={"flex h-12 w-full items-center gap-x-3 px-3"}
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
      className={"flex h-12 w-full items-center space-x-2"}
      onClick={handleSignOut}
    >
      <LogOut className={"h-4"} />

      <span>
        <Trans i18nKey={"common:signOut"} />
      </span>
    </DropdownMenuItem>
  );
}

function TeamAccountsModal(props: {
  accounts: Accounts;
  userId: string;
  account: string;
}) {
  const router = useRouter();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className={"flex h-12 w-full items-center space-x-2"}
          onSelect={(e) => e.preventDefault()}
        >
          <Home className={"h-4"} />

          <span>
            <Trans i18nKey={"common:yourAccounts"} />
          </span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={"common:yourAccounts"} />
          </DialogTitle>
        </DialogHeader>

        <div className={"py-6"}>
          <AccountSelector
            accounts={props.accounts}
            className={"w-full max-w-full"}
            collisionPadding={0}
            features={features}
            onAccountChange={(value) => {
              const path = value
                ? pathsConfig.app.accountHome.replace("[account]", value)
                : pathsConfig.app.home;

              router.replace(path);
            }}
            selectedAccount={props.account}
            userId={props.userId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
