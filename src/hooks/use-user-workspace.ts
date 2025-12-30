"use client";

import { UserWorkspaceContext } from "~/components/features";
import { useWorkspaceContext } from "~/hooks/use-workspace-context";

export function useUserWorkspace() {
  return useWorkspaceContext(
    UserWorkspaceContext,
    "useUserWorkspace must be used within a UserWorkspaceProvider. This is only provided within the user workspace /home"
  );
}
