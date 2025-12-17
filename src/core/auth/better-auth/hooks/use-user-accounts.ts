"use client";

import { useQuery } from "@tanstack/react-query";

import { authClient } from "../client";
import type { UserAccount } from "../types";

/**
 * Hook for getting user's linked accounts/identities
 * Migrated from Supabase to Better Auth
 */
export function useUserAccounts() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ["user-accounts", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { accounts: [], hasMultipleAccounts: false };
      }

      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      // Better Auth uses listAccounts API endpoint
      const response = await fetch(`${baseURL}${apiPath}/list-accounts`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user accounts");
      }

      const result = await response.json();
      const accounts = (result.accounts || []) as UserAccount[];
      const hasMultipleAccounts = accounts.length > 1;

      return {
        accounts,
        hasMultipleAccounts,
        isProviderConnected: (provider: string) =>
          accounts.some((acc) => acc.provider === provider),
      };
    },
    enabled: !!session?.user?.id,
  });
}
