"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "~/lib/auth";
import pathsConfig from "~/lib/config/paths.config";

export function useSignInWithProvider() {
  return useMutation({
    mutationFn: async (params: { provider: string; redirectTo?: string }) => {
      const callbackURL = params.redirectTo || pathsConfig.app.home;

      // Keycloak uses genericOAuth plugin, others use socialProviders
      const result =
        params.provider === "keycloak"
          ? await authClient.signIn.oauth2({
              providerId: params.provider,
              callbackURL,
            })
          : await authClient.signIn.social({
              provider: params.provider as "github" | "discord",
              callbackURL,
            });

      if (result.error) {
        throw result.error;
      }

      return { url: result.data?.url || callbackURL };
    },
  });
}
