'use client';

import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';

type Provider = 'google' | 'github' | 'apple' | 'microsoft' | 'facebook' | 'keycloak';

interface SignInWithProviderOptions {
  provider: Provider;
  redirectTo?: string;
}

/**
 * Hook to sign in with OAuth provider
 * Replaces useSignInWithProvider from Supabase
 */
export function useSignInWithProvider() {
  return useMutation({
    mutationKey: ['auth', 'sign-in-with-provider'],
    mutationFn: async (options: SignInWithProviderOptions) => {
      const callbackUrl = options.redirectTo || '/home';
      
      await nextAuthSignIn(options.provider, {
        callbackUrl,
        redirect: true,
      });
    },
  });
}

