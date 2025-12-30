"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { LoadingOverlay } from "~/components/loading-overlay";
import { Trans } from "~/components/trans";
import { useSignInWithProvider } from "~/hooks/use-sign-in-with-provider";
import type { Provider } from "~/lib/auth/types";

import { OauthProviders } from "./oauth-providers";

export function SignInMethodsContainer(props: {
  paths: {
    callback: string;
    returnPath: string;
  };
  providers: {
    oAuth: Provider[];
  };
}) {
  const _router = useRouter();
  const signInWithProviderMutation = useSignInWithProvider();
  const hasAutoRedirectedRef = useRef(false);

  const shouldAutoRedirect = props.providers.oAuth.length === 1;
  const autoRedirectProvider = props.providers.oAuth[0];

  useEffect(() => {
    if (!shouldAutoRedirect || hasAutoRedirectedRef.current) {
      return;
    }
    hasAutoRedirectedRef.current = true;

    signInWithProviderMutation.mutateAsync({
      provider: autoRedirectProvider,
      redirectTo: props.paths.returnPath || "/dashboard",
    });
  }, [
    autoRedirectProvider,
    props.paths.returnPath,
    shouldAutoRedirect,
    signInWithProviderMutation,
  ]);

  if (shouldAutoRedirect || signInWithProviderMutation.isPending) {
    return (
      <>
        <LoadingOverlay />
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-muted-foreground text-sm">
            <Trans
              i18nKey="auth:redirectingToProvider"
              values={{
                provider: autoRedirectProvider
                  ? autoRedirectProvider.charAt(0).toUpperCase() +
                    autoRedirectProvider.slice(1)
                  : "provider",
              }}
            />
          </p>
        </div>
      </>
    );
  }

  return (
    <OauthProviders
      enabledProviders={props.providers.oAuth}
      paths={{
        callback: props.paths.callback,
        returnPath: props.paths.returnPath,
      }}
      shouldCreateUser={false}
    />
  );
}
