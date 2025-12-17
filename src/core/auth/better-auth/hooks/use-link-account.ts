"use client";

import { useMutation } from "@tanstack/react-query";

/**
 * Hook for linking an OAuth account
 * Migrated from Supabase to Better Auth
 * Note: Account linking typically happens through OAuth flow redirect
 */
export function useLinkAccount() {
  return useMutation({
    mutationFn: async (provider: string) => {
      // Account linking in Better Auth typically happens through OAuth redirect
      // Redirect to the OAuth provider with account linking intent
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      // Better Auth handles account linking through OAuth flow
      // Redirect to the sign-in with provider endpoint
      window.location.href = `${baseURL}${apiPath}/sign-in/social?provider=${provider}&link=true`;

      // This will redirect, so we return a promise that never resolves
      return new Promise<never>(() => {
        // Intentional: Promise never resolves because window.location.href redirects
      });
    },
  });
}
