'use client';

import { useMutation } from '@tanstack/react-query';

interface SignUpCredentials {
  email: string;
  password: string;
  emailRedirectTo?: string;
  captchaToken?: string;
}

/**
 * Hook to sign up with email and password
 * Replaces useSignUpWithEmailAndPassword from Supabase
 */
export function useSignUpWithEmailPassword() {
  return useMutation({
    mutationKey: ['auth', 'sign-up-with-email-password'],
    mutationFn: async (credentials: SignUpCredentials) => {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          captchaToken: credentials.captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // After successful sign-up, automatically sign in
      // This mimics Supabase's behavior
      return data;
    },
  });
}

