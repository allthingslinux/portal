"use client";

import { useMutation } from "@tanstack/react-query";

type UnlinkAccountParams = {
  accountId: string;
};

/**
 * Hook for unlinking an OAuth account
 * Migrated from Supabase to Better Auth
 */
export function useUnlinkAccount() {
  return useMutation({
    mutationFn: async (params: UnlinkAccountParams) => {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      // Better Auth uses unlinkAccount API endpoint
      const response = await fetch(`${baseURL}${apiPath}/unlink-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: params.accountId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to unlink account" }));
        throw new Error(error.message || "Failed to unlink account");
      }

      const data = await response.json();
      return { data, error: null };
    },
  });
}
