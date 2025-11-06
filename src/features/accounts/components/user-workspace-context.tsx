'use client';

import { createContext } from 'react';

import { Tables } from '~/core/database/supabase/database.types';
import { JWTUserData } from '~/core/database/supabase/types';

interface UserWorkspace {
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

  user: JWTUserData;
}

export const UserWorkspaceContext = createContext<UserWorkspace>(
  {} as UserWorkspace,
);

export function UserWorkspaceContextProvider(
  props: React.PropsWithChildren<{
    value: UserWorkspace;
  }>,
) {
  return (
    <UserWorkspaceContext.Provider value={props.value}>
      {props.children}
    </UserWorkspaceContext.Provider>
  );
}
