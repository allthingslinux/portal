'use client';

import { useCallback } from 'react';

import type { z } from 'zod';

import { useSignInWithEmailPassword } from '@portal/supabase/hooks/use-sign-in-with-email-password';

import { useCaptcha } from '../captcha/client';
import { useLastAuthMethod } from '../hooks/use-last-auth-method';
import type { PasswordSignInSchema } from '../schemas/password-sign-in.schema';
import { AuthErrorAlert } from './auth-error-alert';
import { PasswordSignInForm } from './password-sign-in-form';

export function PasswordSignInContainer({
  onSignIn,
  captchaSiteKey,
}: {
  onSignIn?: (userId?: string) => unknown;
  captchaSiteKey?: string;
}) {
  const captcha = useCaptcha({ siteKey: captchaSiteKey });
  const signInMutation = useSignInWithEmailPassword();
  const { recordAuthMethod } = useLastAuthMethod();
  const isLoading = signInMutation.isPending;
  const isRedirecting = signInMutation.isSuccess;

  const onSubmit = useCallback(
    async (credentials: z.infer<typeof PasswordSignInSchema>) => {
      try {
        const data = await signInMutation.mutateAsync({
          ...credentials,
          options: { captchaToken: captcha.token },
        });

        // Record successful password sign-in
        recordAuthMethod('password', { email: credentials.email });

        if (onSignIn) {
          const userId = data?.user?.id;

          onSignIn(userId);
        }
      } catch {
        // wrong credentials, do nothing
      } finally {
        captcha.reset();
      }
    },
    [captcha, onSignIn, signInMutation, recordAuthMethod],
  );

  return (
    <>
      <AuthErrorAlert error={signInMutation.error} />

      <div>
        <PasswordSignInForm
          onSubmit={onSubmit}
          loading={isLoading}
          redirecting={isRedirecting}
        />

        {captcha.field}
      </div>
    </>
  );
}
