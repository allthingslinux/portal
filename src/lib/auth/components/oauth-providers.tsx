"use client";

import { If } from "~/components/if";
import { LoadingOverlay } from "~/components/loading-overlay";
import { Trans } from "~/components/trans";
import { useSignInWithProvider } from "~/hooks/use-sign-in-with-provider";
import type { Provider } from "~/lib/auth/types";

import { AuthErrorAlert } from "./auth-error-alert";
import { AuthProviderButton } from "./auth-provider-button";

export const OauthProviders: React.FC<{
  shouldCreateUser: boolean;
  enabledProviders: Provider[];
  paths: {
    callback: string;
    returnPath: string;
  };
}> = (props) => {
  console.log("🔧 OauthProviders rendered with:", {
    enabledProviders: props.enabledProviders,
    paths: props.paths
  });
  
  const signInWithProviderMutation = useSignInWithProvider();
  const loading = signInWithProviderMutation.isPending;
  
  console.log("⏳ Loading state:", loading);

  const enabledProviders = props.enabledProviders;

  if (!enabledProviders?.length) {
    console.log("❌ No enabled providers found");
    return null;
  }

  console.log("✅ Rendering providers:", enabledProviders);

  return (
    <>
      {/* Temporarily disabled LoadingOverlay for debugging
      <If condition={loading}>
        <LoadingOverlay />
      </If>
      */}
      {loading && console.log("🔄 LoadingOverlay would be showing")}

      <div className="flex w-full flex-1 flex-col space-y-3">
        <div className="flex-col space-y-2">
          {enabledProviders.map((provider) => (
            <AuthProviderButton
              key={provider}
              onClick={(e) => {
                console.log("🖱️ Raw button click event:", e);
                console.log("🖱️ Button clicked for provider:", provider);
                console.log("🔍 Event target:", e.target);
                console.log("🔍 Current target:", e.currentTarget);
                
                try {
                  const callbackUrl = props.paths.returnPath || "/dashboard";
                  console.log("📍 Using callback URL:", callbackUrl);
                  console.log("🚀 About to call signInWithProviderMutation.mutate");
                  
                  signInWithProviderMutation.mutate({
                    provider,
                    redirectTo: callbackUrl,
                  });
                  
                  console.log("✅ Mutation call completed");
                } catch (error) {
                  console.error("💥 Error in click handler:", error);
                }
              }}
              providerId={provider}
            >
              <Trans
                i18nKey="auth:signInWithProvider"
                values={{ provider: getProviderName(provider) }}
              />
            </AuthProviderButton>
          ))}
        </div>

        <AuthErrorAlert error={signInWithProviderMutation.error} />
      </div>
    </>
  );
};

function getProviderName(providerId: string) {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return providerId.endsWith(".com")
    ? capitalize(providerId.split(".com")[0] || providerId)
    : capitalize(providerId);
}
