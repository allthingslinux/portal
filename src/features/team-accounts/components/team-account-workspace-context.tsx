"use client";

import { createContext } from "react";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import type { Database } from "~/core/database/supabase/database.types";

type AccountWorkspace = {
  accounts: Database["public"]["Views"]["user_accounts"]["Row"][];
  account: Database["public"]["Functions"]["team_account_workspace"]["Returns"][0];
  user: BetterAuthUser;
};

export const TeamAccountWorkspaceContext = createContext<AccountWorkspace>(
  {} as AccountWorkspace
);

export function TeamAccountWorkspaceContextProvider(
  props: React.PropsWithChildren<{ value: AccountWorkspace }>
) {
  return (
    <TeamAccountWorkspaceContext.Provider value={props.value}>
      {props.children}
    </TeamAccountWorkspaceContext.Provider>
  );
}
