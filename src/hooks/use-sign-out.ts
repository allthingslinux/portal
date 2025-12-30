"use client";

import { useMutation } from "@tanstack/react-query";

import { authClient } from "~/lib/auth";

/**
 * Hook for signing out
 * Migrated from NextAuth to Better Auth
 */
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}
