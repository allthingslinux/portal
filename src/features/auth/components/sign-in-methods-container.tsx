"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { If } from "~/components/portal/if";
import { LoadingOverlay } from "~/components/portal/loading-overlay";
import { Trans } from "~/components/portal/trans";
import { Separator } from "~/components/ui/separator";
import { useSignInWithProvider } from "~/core/auth/better-auth/hooks";
import type { Provider } from "~/core/auth/better-auth/types";

import { LastAuthMethodHint } from "./last-auth-method-hint";
import { OauthProviders } from "./oauth-providers";
import { PasswordSignInContainer } from "./password-sign-in-container";

export function SignInMethodsContainer(props: {
  paths: {
    callback: string;
    joinTeam: string;
    returnPath: string;
  };

  providers: {
    password: boolean;
    oAuth: Provider[];
  };

  captchaSiteKey?: string;
}) {
  const router = useRouter();
  const signInWithProviderMutation = useSignInWithProvider();
  const hasAutoRedirectedRef = useRef(false);

  const shouldAutoRedirect =
    !props.providers.password && props.providers.oAuth.length === 1;
  const autoRedirectProvider = props.providers.oAuth[0];

  const onSignIn = useCallback(() => {
    const returnPath = props.paths.returnPath || "/home";

    router.replace(returnPath);
  }, [props.paths.returnPath, router]);

  useEffect(() => {
    if (!shouldAutoRedirect || hasAutoRedirectedRef.current) {
      return;
    }
    hasAutoRedirectedRef.current = true;

    const run = async () => {
      await signInWithProviderMutation.mutateAsync({
        provider: autoRedirectProvider,
        redirectTo: props.paths.returnPath || "/home",
      });
    };

    run();
  }, [
    autoRedirectProvider,
    props.paths.returnPath,
    shouldAutoRedirect,
    signInWithProviderMutation,
  ]);

  // Show loading state immediately when auto-redirecting (before useEffect runs)
  // This prevents the form from flashing before redirect
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
    <>
      <LastAuthMethodHint />

      <If condition={props.providers.password}>
        <PasswordSignInContainer
          captchaSiteKey={props.captchaSiteKey}
          onSignIn={onSignIn}
        />
      </If>

      <If condition={props.providers.oAuth.length}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              <Trans i18nKey="auth:orContinueWith" />
            </span>
          </div>
        </div>

        <OauthProviders
          enabledProviders={props.providers.oAuth}
          paths={{
            callback: props.paths.callback,
            returnPath: props.paths.returnPath,
          }}
          shouldCreateUser={false}
        />
      </If>
    </>
  );
}
