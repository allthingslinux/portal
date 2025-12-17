"use client";

import { createContext } from "react";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import type { TeamAccountWorkspace } from "~/home/[account]/_lib/server/team-account-workspace.loader";

type AccountWorkspace = TeamAccountWorkspace & { user: BetterAuthUser };

export const TeamAccountWorkspaceContext =
  createContext<AccountWorkspace | null>(null);

export function TeamAccountWorkspaceContextProvider(
  props: React.PropsWithChildren<{ value: AccountWorkspace }>
) {
  return (
    <TeamAccountWorkspaceContext.Provider value={props.value}>
      {props.children}
    </TeamAccountWorkspaceContext.Provider>
  );
}
