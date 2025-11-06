'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useAppEvents } from '~/shared/events';
import { useSignUpWithEmailAndPassword } from '~/core/database/supabase/hooks/use-sign-up-with-email-password';

import { useLastAuthMethod } from './use-last-auth-method';

type SignUpCredentials = {
  email: string;
  password: string;
};

type UseSignUpFlowProps = {
  emailRedirectTo: string;
  onSignUp?: (userId?: string) => unknown;
  captchaToken?: string;
  resetCaptchaToken?: () => void;
};

/**
 * @name usePasswordSignUpFlow
 * @description
 * This hook is used to handle the sign up flow using the email and password method.
 */
export function usePasswordSignUpFlow({
  emailRedirectTo,
  onSignUp,
  captchaToken,
  resetCaptchaToken,
}: UseSignUpFlowProps) {
  const router = useRouter();
  const signUpMutation = useSignUpWithEmailAndPassword();
  const appEvents = useAppEvents();
  const { recordAuthMethod } = useLastAuthMethod();

  const signUp = useCallback(
    async (credentials: SignUpCredentials) => {
      if (signUpMutation.isPending) {
        return;
      }

      try {
        const data = await signUpMutation.mutateAsync({
          ...credentials,
          emailRedirectTo,
          captchaToken,
        });

        // Record last auth method
        recordAuthMethod('password', { email: credentials.email });

        // emit event to track sign up
        appEvents.emit({
          type: 'user.signedUp',
          payload: {
            method: 'password',
          },
        });

        // Update URL with success status. This is useful for password managers
        // to understand that the form was submitted successfully.
        const url = new URL(window.location.href);

        url.searchParams.set('status', 'success');
        router.replace(url.pathname + url.search);

        if (onSignUp) {
          onSignUp(data.user?.id);
        }
      } catch (error) {
        console.error(error);

        throw error;
      } finally {
        resetCaptchaToken?.();
      }
    },
    [
      signUpMutation,
      emailRedirectTo,
      captchaToken,
      appEvents,
      router,
      onSignUp,
      resetCaptchaToken,
      recordAuthMethod,
    ],
  );

  return {
    signUp,
    loading: signUpMutation.isPending,
    error: signUpMutation.error,
    showVerifyEmailAlert: signUpMutation.isSuccess,
  };
}
