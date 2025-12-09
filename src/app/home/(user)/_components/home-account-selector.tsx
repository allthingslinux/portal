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
      accounts={props.accounts}
      collapsed={!context?.open}
      collisionPadding={props.collisionPadding ?? 20}
      features={features}
      onAccountChange={(value) => {
        if (value) {
          const path = pathsConfig.app.accountHome.replace("[account]", value);
          router.replace(path);
        }
      }}
      userId={props.userId}
    />
  );
}
