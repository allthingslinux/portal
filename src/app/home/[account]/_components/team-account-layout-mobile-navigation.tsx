'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Home, LogOut, Menu } from 'lucide-react';

import { AccountSelector } from '~/features/accounts/components/account-selector';
import { useSignOut } from '~/core/database/supabase/hooks/use-sign-out';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Trans } from '~/components/makerkit/trans';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { getTeamAccountSidebarConfig } from '~/config/team-account-navigation.config';

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
  }>,
) => {
  const signOut = useSignOut();

  const Links = getTeamAccountSidebarConfig(props.account).routes.map(
    (item, index) => {
      if ('children' in item) {
        return item.children.map((child) => {
          return (
            <DropdownLink
              key={child.path}
              Icon={child.Icon}
              path={child.path}
              label={child.label}
            />
          );
        });
      }

      if ('divider' in item) {
        return <DropdownMenuSeparator key={index} />;
      }
    },
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'w-screen rounded-none'}>
        <TeamAccountsModal
          userId={props.userId}
          accounts={props.accounts}
          account={props.account}
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
  }>,
) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={props.path}
        className={'flex h-12 w-full items-center gap-x-3 px-3'}
      >
        {props.Icon}

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>,
) {
  return (
    <DropdownMenuItem
      className={'flex h-12 w-full items-center space-x-2'}
      onClick={props.onSignOut}
    >
      <LogOut className={'h-4'} />

      <span>
        <Trans i18nKey={'common:signOut'} />
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
          className={'flex h-12 w-full items-center space-x-2'}
          onSelect={(e) => e.preventDefault()}
        >
          <Home className={'h-4'} />

          <span>
            <Trans i18nKey={'common:yourAccounts'} />
          </span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'common:yourAccounts'} />
          </DialogTitle>
        </DialogHeader>

        <div className={'py-6'}>
          <AccountSelector
            className={'w-full max-w-full'}
            collisionPadding={0}
            userId={props.userId}
            accounts={props.accounts}
            features={features}
            selectedAccount={props.account}
            onAccountChange={(value) => {
              const path = value
                ? pathsConfig.app.accountHome.replace('[account]', value)
                : pathsConfig.app.home;

              router.replace(path);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
