'use client';

import { useMemo } from 'react';

import Link from 'next/link';

import {
  ChevronsUpDown,
  Home,
  LogOut,
  MessageCircleQuestion,
  Shield,
} from 'lucide-react';

import { JWTUserData } from '@portal/supabase/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';
import { If } from '@portal/ui/if';
import { SubMenuModeToggle } from '@portal/ui/mode-toggle';
import { ProfileAvatar } from '@portal/ui/profile-avatar';
import { Trans } from '@portal/ui/trans';
import { cn } from '@portal/ui/utils';

import { usePersonalAccountData } from '../hooks/use-personal-account-data';

export function PersonalAccountDropdown({
  className,
  user,
  signOutRequested,
  showProfileName = true,
  paths,
  features,
  account,
}: {
  user: JWTUserData;

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
    account,
  );

  const signedInAsLabel = useMemo(() => {
    const email = user?.email ?? undefined;
    const phone = user?.phone ?? undefined;

    return email ?? phone;
  }, [user]);

  const displayName =
    personalAccountData?.name ?? account?.name ?? user?.email ?? '';

  const isSuperAdmin = useMemo(() => {
    const hasAdminRole = user?.app_metadata.role === 'super-admin';
    const isAal2 = user?.aal === 'aal2';

    return hasAdminRole && isAal2;
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        data-test={'account-dropdown-trigger'}
        className={cn(
          'animate-in group/trigger fade-in focus:outline-primary flex cursor-pointer items-center group-data-[minimized=true]/sidebar:px-0',
          className ?? '',
          {
            ['active:bg-secondary/50 items-center gap-4 rounded-md' +
            ' hover:bg-secondary border border-dashed p-2 transition-colors']:
              showProfileName,
          },
        )}
      >
        <ProfileAvatar
          className={
            'group-hover/trigger:border-background/50 rounded-md border border-transparent transition-colors'
          }
          fallbackClassName={'rounded-md border'}
          displayName={displayName ?? user?.email ?? ''}
          pictureUrl={personalAccountData?.picture_url}
        />

        <If condition={showProfileName}>
          <div
            className={
              'fade-in animate-in flex w-full flex-col truncate text-left group-data-[minimized=true]/sidebar:hidden'
            }
          >
            <span
              data-test={'account-dropdown-display-name'}
              className={'truncate text-sm'}
            >
              {displayName}
            </span>

            <span
              data-test={'account-dropdown-email'}
              className={'text-muted-foreground truncate text-xs'}
            >
              {signedInAsLabel}
            </span>
          </div>

          <ChevronsUpDown
            className={
              'text-muted-foreground mr-1 h-8 group-data-[minimized=true]/sidebar:hidden'
            }
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'xl:min-w-[15rem]!'}>
        <DropdownMenuItem className={'h-10! rounded-none'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-xs'}
          >
            <div className={'text-muted-foreground'}>
              <Trans i18nKey={'common:signedInAs'} />
            </div>

            <div>
              <span className={'block truncate'}>{signedInAsLabel}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex cursor-pointer items-center space-x-2'}
            href={paths.home}
          >
            <Home className={'h-5'} />

            <span>
              <Trans i18nKey={'common:routes.home'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex cursor-pointer items-center space-x-2'}
            href={'/docs'}
          >
            <MessageCircleQuestion className={'h-5'} />

            <span>
              <Trans i18nKey={'common:documentation'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <If condition={isSuperAdmin}>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              className={
                's-full flex cursor-pointer items-center space-x-2 text-yellow-700 dark:text-yellow-500'
              }
              href={'/admin'}
            >
              <Shield className={'h-5'} />

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
          data-test={'account-dropdown-sign-out'}
          role={'button'}
          className={'cursor-pointer'}
          onClick={signOutRequested}
        >
          <span className={'flex w-full items-center space-x-2'}>
            <LogOut className={'h-5'} />

            <span>
              <Trans i18nKey={'auth:signOut'} />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
