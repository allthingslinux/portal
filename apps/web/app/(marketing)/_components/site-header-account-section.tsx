'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { PersonalAccountDropdown } from '@portal/accounts/personal-account-dropdown';
import { useSignOut } from '@portal/supabase/hooks/use-sign-out';
import { JWTUserData } from '@portal/supabase/types';
import { Button } from '@portal/ui/button';
import { If } from '@portal/ui/if';
import { Trans } from '@portal/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const ModeToggle = dynamic(
  () =>
    import('@portal/ui/mode-toggle').then((mod) => ({
      default: mod.ModeToggle,
    })),
  { ssr: false },
);

const MobileModeToggle = dynamic(
  () =>
    import('@portal/ui/mobile-mode-toggle').then((mod) => ({
      default: mod.MobileModeToggle,
    })),
  { ssr: false },
);

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function SiteHeaderAccountSection({
  user,
}: {
  user: JWTUserData | null;
}) {
  const signOut = useSignOut();

  if (user) {
    return (
      <PersonalAccountDropdown
        showProfileName={false}
        paths={paths}
        features={features}
        user={user}
        signOutRequested={() => signOut.mutateAsync()}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div
      className={'animate-in fade-in flex items-center gap-x-2 duration-500'}
    >
      <div className={'hidden md:flex'}>
        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>
      </div>

      <div className={'md:hidden'}>
        <If condition={features.enableThemeToggle}>
          <MobileModeToggle />
        </If>
      </div>

      <div className={'flex items-center gap-x-2'}>
        <Button
          className={'hidden md:flex md:text-sm'}
          asChild
          variant={'outline'}
          size={'sm'}
        >
          <Link href={pathsConfig.auth.signIn}>
            <Trans i18nKey={'auth:signIn'} />
          </Link>
        </Button>

        <Button
          asChild
          className="text-xs md:text-sm"
          variant={'default'}
          size={'sm'}
        >
          <Link href={pathsConfig.auth.signUp}>
            <Trans i18nKey={'auth:signUp'} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
