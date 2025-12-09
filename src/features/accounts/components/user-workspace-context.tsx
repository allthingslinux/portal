"use client";

import { createContext } from "react";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";

type UserWorkspace = {
  accounts: Array<{
    label: string | null;
    value: string | null;
    image: string | null;
  }>;

  workspace: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };

  user: BetterAuthUser;
};

export const UserWorkspaceContext = createContext<UserWorkspace>(
  {} as UserWorkspace
);

export function UserWorkspaceContextProvider(
  props: React.PropsWithChildren<{
    value: UserWorkspace;
  }>
) {
  return (
    <UserWorkspaceContext.Provider value={props.value}>
      {props.children}
    </UserWorkspaceContext.Provider>
  );
}
