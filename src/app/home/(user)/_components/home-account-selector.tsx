'use client';

import { useContext } from 'react';

import { useRouter } from 'next/navigation';

import { AccountSelector } from '~/features/accounts/components/account-selector';
import { SidebarContext } from '~/components/ui/sidebar';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const features = {
  enableTeamCreation: featureFlagsConfig.enableTeamCreation,
};

export function HomeAccountSelector(props: {
  accounts: Array<{
    label: string | null;
    value: string | null;
    image: string | null;
  }>;

  userId: string;
  collisionPadding?: number;
}) {
  const router = useRouter();
  const context = useContext(SidebarContext);

  return (
    <AccountSelector
      collapsed={!context?.open}
      collisionPadding={props.collisionPadding ?? 20}
      accounts={props.accounts}
      features={features}
      userId={props.userId}
      onAccountChange={(value) => {
        if (value) {
          const path = pathsConfig.app.accountHome.replace('[account]', value);
          router.replace(path);
        }
      }}
    />
  );
}
