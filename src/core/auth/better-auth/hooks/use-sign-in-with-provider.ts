"use client";

import { useMutation } from "@tanstack/react-query";

import { authClient } from "../client";

/**
 * Hook for signing in with OAuth provider
 * Migrated from NextAuth to Better Auth
 */
export function useSignInWithProvider() {
  return useMutation({
    mutationFn: async (params: {
      provider: "google" | "keycloak" | string;
      redirectTo?: string;
    }) => {
      const result = await authClient.signIn.social({
        provider: params.provider as "google" | "keycloak",
        callbackURL: params.redirectTo || "/home",
      });

      if (result.error) {
        throw result.error;
      }

      // Better Auth returns a redirect URL for OAuth
      // Return in format expected by deprecated hooks
      const redirectUrl = result.data?.url || params.redirectTo || "/home";
      return {
        url: redirectUrl,
      };
    },
  });
}
