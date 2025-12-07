'use client';

import { useWorkspaceContext } from '~/shared/hooks/use-workspace-context';

import { UserWorkspaceContext } from '../components';

export function useUserWorkspace() {
  return useWorkspaceContext(
    UserWorkspaceContext,
    'useUserWorkspace must be used within a UserWorkspaceProvider. This is only provided within the user workspace /home',
  );
}
