import Link from "next/link";
import { use } from "react";

import {
  CardButton,
  CardButtonHeader,
  CardButtonTitle,
} from "~/components/card-button";
import {
  EmptyState,
  EmptyStateButton,
  EmptyStateHeading,
  EmptyStateText,
} from "~/components/empty-state";
import { Trans } from "~/components/trans";

import { loadUserWorkspace } from "../_lib/server/load-user-workspace";
import { HomeAddAccountButton } from "./home-add-account-button";

export function HomeAccountsList() {
  const { accounts } = use(loadUserWorkspace()) as {
    accounts: Array<{ label: string; value: string; image: string | null }>;
  };

  if (!accounts.length) {
    return <HomeAccountsListEmptyState />;
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map((account) => (
          <CardButton asChild key={account.value}>
            <Link href="/dashboard">
              <CardButtonHeader>
                <CardButtonTitle>{account.label}</CardButtonTitle>
              </CardButtonHeader>
            </Link>
          </CardButton>
        ))}
      </div>
    </div>
  );
}

function HomeAccountsListEmptyState() {
  return (
    <div className={"flex flex-1"}>
      <EmptyState>
        <EmptyStateButton asChild>
          <HomeAddAccountButton className={"mt-4"} />
        </EmptyStateButton>
        <EmptyStateHeading>
          <Trans i18nKey={"account:noAccountsYet"} />
        </EmptyStateHeading>
        <EmptyStateText>
          <Trans i18nKey={"account:getStarted"} />
        </EmptyStateText>
      </EmptyState>
    </div>
  );
}
