'use client';

import { useCallback } from 'react';

import type {
  Provider,
  SignInWithOAuthCredentials,
} from '@supabase/supabase-js';

import { useSignInWithProvider } from '~/core/database/supabase/hooks/use-sign-in-with-provider';
import { If } from '~/components/makerkit/if';
import { LoadingOverlay } from '~/components/makerkit/loading-overlay';
import { Trans } from '~/components/makerkit/trans';

import { useLastAuthMethod } from '../hooks/use-last-auth-method';
import { AuthErrorAlert } from './auth-error-alert';
import { AuthProviderButton } from './auth-provider-button';

/**
 * @name OAUTH_SCOPES
 * @description
 * The OAuth scopes are used to specify the permissions that the application is requesting from the user.
 *
 * Please add your OAuth providers here and the scopes you want to use.
 *
 * @see https://supabase.com/docs/guides/auth/social-login
 */
const OAUTH_SCOPES: Partial<Record<Provider, string>> = {
  azure: 'email',
  keycloak: 'openid',
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
        return Promise.reject(new Error(`No credential returned`));
      }
    },
    [],
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

      <div className={'flex w-full flex-1 flex-col space-y-3'}>
        <div className={'flex-col space-y-2'}>
          {enabledProviders.map((provider) => {
            return (
              <AuthProviderButton
                key={provider}
                providerId={provider}
                onClick={() => {
                  const origin = window.location.origin;
                  const queryParams = new URLSearchParams();

                  if (props.paths.returnPath) {
                    queryParams.set('next', props.paths.returnPath);
                  }

                  const redirectPath = [
                    props.paths.callback,
                    queryParams.toString(),
                  ].join('?');

                  const redirectTo = [origin, redirectPath].join('');
                  const scopes = OAUTH_SCOPES[provider] ?? undefined;

                  const credentials = {
                    provider,
                    options: {
                      redirectTo,
                      queryParams: props.queryParams,
                      scopes,
                    },
                  } satisfies SignInWithOAuthCredentials;

                  return onSignInWithProvider(async () => {
                    const result =
                      await signInWithProviderMutation.mutateAsync(credentials);

                    // Record successful OAuth sign-in
                    recordAuthMethod('oauth', { provider });

                    return result;
                  });
                }}
              >
                <Trans
                  i18nKey={'auth:signInWithProvider'}
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

  if (providerId.endsWith('.com')) {
    return capitalize(providerId.split('.com')[0]!);
  }

  return capitalize(providerId);
}
