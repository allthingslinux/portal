"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AccountSelector } from "~/components/features/account-selector";
import { SidebarContext } from "~/components/ui/sidebar";

const features = {
  enableTeamCreation: false, // Team creation disabled
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
      _features={features}
      accounts={props.accounts}
      collapsed={!context?.open}
      collisionPadding={props.collisionPadding ?? 20}
      onAccountChange={(value) => {
        if (value) {
          // Redirect to dashboard since we only have personal accounts
          router.replace("/dashboard");
        }
      }}
      selectedAccount={undefined}
      userId={props.userId}
    />
  );
}
