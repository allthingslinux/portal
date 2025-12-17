"use client";

import { useWorkspaceContext } from "~/shared/hooks/use-workspace-context";

import { TeamAccountWorkspaceContext } from "../components";

/**
 * @name useTeamAccountWorkspace
 * @description A hook to access the account workspace data.
 * @returns The account workspace data.
 */
export function useTeamAccountWorkspace() {
  return useWorkspaceContext(
    TeamAccountWorkspaceContext,
    "useTeamAccountWorkspace must be used within a TeamAccountWorkspaceContext.Provider. This is only provided within the account workspace /home/[account]"
  );
}
