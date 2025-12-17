"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncUserFromKeycloak } from "../server/sync-user-from-keycloak";

/**
 * Hook to sync user data from Keycloak
 * Call this periodically or on mount to keep user data in sync
 */
export function useSyncUserFromKeycloak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncUserFromKeycloak,
    onSuccess: (result) => {
      // Always invalidate session to get fresh user data
      // Even if no update was needed, we want to ensure UI shows latest data
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["session"] });
        queryClient.invalidateQueries({ queryKey: ["account:data"] });
      }
    },
  });
}

