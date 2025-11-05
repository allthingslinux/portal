'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import type { Provider } from '@supabase/supabase-js';

import { isBrowser } from '@portal/shared/utils';
import { If } from '@portal/ui/if';
import { Separator } from '@portal/ui/separator';
import { Trans } from '@portal/ui/trans';

import { LastAuthMethodHint } from './last-auth-method-hint';
import { MagicLinkAuthContainer } from './magic-link-auth-container';
import { OauthProviders } from './oauth-providers';
import { OtpSignInContainer } from './otp-sign-in-container';
import { PasswordSignInContainer } from './password-sign-in-container';

export function SignInMethodsContainer(props: {
  paths: {
    callback: string;
    joinTeam: string;
    returnPath: string;
  };

  providers: {
    password: boolean;
    magicLink: boolean;
    otp: boolean;
    oAuth: Provider[];
  };

  captchaSiteKey?: string;
}) {
  const router = useRouter();

  const redirectUrl = isBrowser()
    ? new URL(props.paths.callback, window?.location.origin).toString()
    : '';

  const onSignIn = useCallback(() => {
    const returnPath = props.paths.returnPath || '/home';

    router.replace(returnPath);
  }, [props.paths.returnPath, router]);

  return (
    <>
      <LastAuthMethodHint />

      <If condition={props.providers.password}>
        <PasswordSignInContainer
          onSignIn={onSignIn}
          captchaSiteKey={props.captchaSiteKey}
        />
      </If>

      <If condition={props.providers.magicLink}>
        <MagicLinkAuthContainer
          redirectUrl={redirectUrl}
          shouldCreateUser={false}
          captchaSiteKey={props.captchaSiteKey}
        />
      </If>

      <If condition={props.providers.otp}>
        <OtpSignInContainer
          shouldCreateUser={false}
          captchaSiteKey={props.captchaSiteKey}
        />
      </If>

      <If condition={props.providers.oAuth.length}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">
              <Trans i18nKey="auth:orContinueWith" />
            </span>
          </div>
        </div>

        <OauthProviders
          enabledProviders={props.providers.oAuth}
          shouldCreateUser={false}
          paths={{
            callback: props.paths.callback,
            returnPath: props.paths.returnPath,
          }}
        />
      </If>
    </>
  );
}
