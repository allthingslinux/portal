"use client";

import { useCallback } from "react";
import { If } from "~/components/makerkit/if";
import { LoadingOverlay } from "~/components/makerkit/loading-overlay";
import { Trans } from "~/components/makerkit/trans";
import { useSignInWithProvider } from "~/core/auth/better-auth/hooks";
import type { Provider } from "~/core/auth/better-auth/types";

import { useLastAuthMethod } from "../hooks/use-last-auth-method";
import { AuthErrorAlert } from "./auth-error-alert";
import { AuthProviderButton } from "./auth-provider-button";

/**
 * @name OAUTH_SCOPES
 * @description
 * The OAuth scopes are used to specify the permissions that the application is requesting from the user.
 *
 * Please add your OAuth providers here and the scopes you want to use.
 *
 * OAuth provider configuration for Better Auth
 */
const _OAUTH_SCOPES: Partial<Record<Provider, string>> = {
  azure: "email",
  keycloak: "openid",
  // add your OAuth providers here
};

export const OauthProviders: React.FC<{
  shouldCreateUser: boolean;
  enabledProviders: Provider[];
  queryParams?: Record<string, string>;

  paths: {
    callback: string;
    returnPath: string;
  };
}> = (props) => {
  const signInWithProviderMutation = useSignInWithProvider();
  const { recordAuthMethod } = useLastAuthMethod();

  // we make the UI "busy" until the next page is fully loaded
  const loading = signInWithProviderMutation.isPending;

  const onSignInWithProvider = useCallback(
    async (signInRequest: () => Promise<unknown>) => {
      const credential = await signInRequest();

      if (!credential) {
        return Promise.reject(new Error("No credential returned"));
      }
    },
    []
  );

  const enabledProviders = props.enabledProviders;

  if (!enabledProviders?.length) {
    return null;
  }

  return (
    <>
      <If condition={loading}>
        <LoadingOverlay />
      </If>

      <div className={"flex w-full flex-1 flex-col space-y-3"}>
        <div className={"flex-col space-y-2"}>
          {enabledProviders.map((provider) => {
            return (
              <AuthProviderButton
                key={provider}
                onClick={() => {
                  // Build callback URL with return path
                  const queryParams = new URLSearchParams();

                  if (props.paths.returnPath) {
                    queryParams.set("next", props.paths.returnPath);
                  }

                  // NextAuth handles OAuth callbacks automatically at /api/auth/callback/[provider]
                  // So we just need to set the callbackUrl to where we want to redirect after auth
                  const callbackUrl = props.paths.returnPath || "/home";

                  // Map provider names to Better Auth provider names
                  const providerMap: Record<string, string> = {
                    google: "google",
                    github: "github",
                    apple: "apple",
                    microsoft: "microsoft",
                    facebook: "facebook",
                    keycloak: "keycloak",
                  };

                  const nextAuthProvider = providerMap[provider] || provider;

                  return onSignInWithProvider(async () => {
                    await signInWithProviderMutation.mutateAsync({
                      provider: nextAuthProvider as
                        | "google"
                        | "github"
                        | "apple"
                        | "microsoft"
                        | "facebook"
                        | "keycloak",
                      redirectTo: callbackUrl,
                    });

                    // Record successful OAuth sign-in
                    recordAuthMethod("oauth", { provider });
                  });
                }}
                providerId={provider}
              >
                <Trans
                  i18nKey={"auth:signInWithProvider"}
                  values={{
                    provider: getProviderName(provider),
                  }}
                />
              </AuthProviderButton>
            );
          })}
        </div>

        <AuthErrorAlert error={signInWithProviderMutation.error} />
      </div>
    </>
  );
};

function getProviderName(providerId: string) {
  const capitalize = (value: string) =>
    value.slice(0, 1).toUpperCase() + value.slice(1);

  if (providerId.endsWith(".com")) {
    const [name] = providerId.split(".com");
    return capitalize(name || providerId);
  }

  return capitalize(providerId);
}
