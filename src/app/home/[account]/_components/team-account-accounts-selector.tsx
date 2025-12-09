"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { SidebarContext } from "~/components/ui/sidebar";
import featureFlagsConfig from "~/config/feature-flags.config";
import pathsConfig from "~/config/paths.config";
import { AccountSelector } from "~/features/accounts/components/account-selector";

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
      accounts={params.accounts}
      collapsed={!ctx?.open}
      features={features}
      onAccountChange={(value) => {
        const path = value
          ? pathsConfig.app.accountHome.replace("[account]", value)
          : pathsConfig.app.home;

        router.replace(path);
      }}
      selectedAccount={params.selectedAccount}
      userId={params.userId}
    />
  );
}
