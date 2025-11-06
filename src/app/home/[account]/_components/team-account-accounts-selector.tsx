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

export function TeamAccountAccountsSelector(params: {
  selectedAccount: string;
  userId: string;

  accounts: Array<{
    label: string | null;
    value: string | null;
    image: string | null;
  }>;
}) {
  const router = useRouter();
  const ctx = useContext(SidebarContext);

  return (
    <AccountSelector
      selectedAccount={params.selectedAccount}
      accounts={params.accounts}
      userId={params.userId}
      collapsed={!ctx?.open}
      features={features}
      onAccountChange={(value) => {
        const path = value
          ? pathsConfig.app.accountHome.replace('[account]', value)
          : pathsConfig.app.home;

        router.replace(path);
      }}
    />
  );
}
