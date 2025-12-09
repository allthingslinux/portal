"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Separator } from "~/components/ui/separator";
import type { Provider } from "~/core/database/supabase/supabase-types";

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

  const onSignIn = useCallback(() => {
    const returnPath = props.paths.returnPath || "/home";

    router.replace(returnPath);
  }, [props.paths.returnPath, router]);

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
