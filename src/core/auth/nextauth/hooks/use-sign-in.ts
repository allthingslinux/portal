'use client';

import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';

interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Hook to sign in with email and password
 * Replaces useSignInWithEmailPassword from Supabase
 */
export function useSignInWithEmailPassword() {
  return useMutation({
    mutationKey: ['auth', 'sign-in-with-email-password'],
    mutationFn: async (credentials: SignInCredentials) => {
      const result = await nextAuthSignIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return result;
    },
  });
}

