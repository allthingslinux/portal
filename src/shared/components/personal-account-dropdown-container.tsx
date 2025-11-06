'use client';

import { PersonalAccountDropdown } from '~/features/accounts/components/personal-account-dropdown';
import { useSignOut } from '~/core/database/supabase/hooks/use-sign-out';
import { useUser } from '~/core/database/supabase/hooks/use-user';
import { JWTUserData } from '~/core/database/supabase/types';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function ProfileAccountDropdownContainer(props: {
  user?: JWTUserData | null;
  showProfileName?: boolean;

  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };
}) {
  const signOut = useSignOut();
  const user = useUser(props.user);
  const userData = user.data;

  if (!userData) {
    return null;
  }

  return (
    <PersonalAccountDropdown
      className={'w-full'}
      paths={paths}
      features={features}
      user={userData}
      account={props.account}
      signOutRequested={() => signOut.mutateAsync()}
      showProfileName={props.showProfileName}
    />
  );
}
