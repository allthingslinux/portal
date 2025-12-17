"use client";

import { useEffect, useRef } from "react";
import { If } from "~/components/makerkit/if";
import { LoadingOverlay } from "~/components/makerkit/loading-overlay";
import { Trans } from "~/components/makerkit/trans";
import { Separator } from "~/components/ui/separator";
import { useSignInWithProvider } from "~/core/auth/better-auth/hooks";
import type { Provider } from "~/core/auth/better-auth/types";
import { isBrowser } from "~/shared/utils";

import { ExistingAccountHint } from "./existing-account-hint";
import { OauthProviders } from "./oauth-providers";
import { EmailPasswordSignUpContainer } from "./password-sign-up-container";

export function SignUpMethodsContainer(props: {
  paths: {
    callback: string;
    appHome: string;
  };

  providers: {
    password: boolean;
    oAuth: Provider[];
  };

  displayTermsCheckbox?: boolean;
  captchaSiteKey?: string;
}) {
  const signInWithProviderMutation = useSignInWithProvider();
  const hasAutoRedirectedRef = useRef(false);

  const shouldAutoRedirect =
    !props.providers.password && props.providers.oAuth.length === 1;
  const autoRedirectProvider = props.providers.oAuth[0];

  useEffect(() => {
    if (!shouldAutoRedirect || hasAutoRedirectedRef.current) {
      return;
    }
    hasAutoRedirectedRef.current = true;

    const run = async () => {
      await signInWithProviderMutation.mutateAsync({
        provider: autoRedirectProvider,
        redirectTo: props.paths.appHome,
      });
    };

    run();
  }, [
    autoRedirectProvider,
    props.paths.appHome,
    shouldAutoRedirect,
    signInWithProviderMutation,
  ]);

  const redirectUrl = getCallbackUrl(props);
  const defaultValues = getDefaultValues();

  return (
    <>
      <If condition={signInWithProviderMutation.isPending}>
        <LoadingOverlay />
      </If>

      {/* Show hint if user might already have an account */}
      <ExistingAccountHint />

      <If condition={props.providers.password}>
        <EmailPasswordSignUpContainer
          captchaSiteKey={props.captchaSiteKey}
          defaultValues={defaultValues}
          displayTermsCheckbox={props.displayTermsCheckbox}
          emailRedirectTo={redirectUrl}
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
            returnPath: props.paths.appHome,
          }}
          shouldCreateUser={true}
        />
      </If>
    </>
  );
}

function getCallbackUrl(props: {
  paths: {
    callback: string;
    appHome: string;
  };
}) {
  if (!isBrowser()) {
    return "";
  }

  const redirectPath = props.paths.callback;
  const origin = window.location.origin;
  const url = new URL(redirectPath, origin);

  const searchParams = new URLSearchParams(window.location.search);
  const next = searchParams.get("next");

  if (next) {
    url.searchParams.set("next", next);
  }

  return url.href;
}

function getDefaultValues() {
  if (!isBrowser()) {
    return { email: "" };
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    email: searchParams.get("email") ?? "",
  };
}
