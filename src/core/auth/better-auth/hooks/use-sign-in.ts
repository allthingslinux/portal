"use client";

import { useMutation } from "@tanstack/react-query";

import { authClient } from "../client";

/**
 * Hook for signing in with email and password
 * Migrated from NextAuth to Better Auth
 */
export function useSignInWithEmailPassword() {
  return useMutation({
    mutationFn: async (credentials: {
      email: string;
      password: string;
      options?: { captchaToken?: string };
    }) => {
      const result = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
        // Better Auth doesn't support captcha in sign-in directly
        // You may need to verify captcha server-side
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}
