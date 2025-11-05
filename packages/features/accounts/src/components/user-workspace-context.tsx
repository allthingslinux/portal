'use client';

import { createContext } from 'react';

import { Tables } from '@portal/supabase/database';
import { JWTUserData } from '@portal/supabase/types';

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
    subscription_status: Tables<'subscriptions'>['status'] | null;
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
