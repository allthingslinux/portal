"use client";

import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Separator } from "~/components/ui/separator";
import type { Provider } from "~/core/database/supabase/supabase-types";
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
  const redirectUrl = getCallbackUrl(props);
  const defaultValues = getDefaultValues();

  return (
    <>
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
