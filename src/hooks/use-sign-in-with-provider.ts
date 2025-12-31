"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "~/lib/auth";
import pathsConfig from "~/lib/config/paths.config";

export function useSignInWithProvider() {
  return useMutation({
    mutationFn: async (params: { provider: string; redirectTo?: string }) => {
      console.log("🔐 Sign-in attempt:", params);
      const callbackURL = params.redirectTo || pathsConfig.app.home;
      console.log("📍 Callback URL:", callbackURL);

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

      console.log("📤 Auth result:", result);

      if (result.error) {
        console.error("❌ Auth error:", result.error);
        throw result.error;
      }

      console.log("✅ Auth success, redirecting to:", result.data?.url || callbackURL);
      return { url: result.data?.url || callbackURL };
    },
    onSuccess: (data) => {
      console.log("🎉 Mutation success, redirecting to:", data.url);
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error("💥 Mutation error:", error);
    },
  });
}
