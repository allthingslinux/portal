"use client";

import { useMutation } from "@tanstack/react-query";

import { authClient } from "../client";

/**
 * Hook for signing up with email and password
 * Migrated from NextAuth to Better Auth
 */
export function useSignUpWithEmailAndPassword() {
  return useMutation({
    mutationFn: async (credentials: {
      email: string;
      password: string;
      name?: string;
      emailRedirectTo?: string;
      captchaToken?: string;
    }) => {
      const result = await authClient.signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name || credentials.email.split("@")[0] || "User",
        // Better Auth handles email verification automatically
        // emailRedirectTo and captchaToken may need server-side handling
      });

      if (result.error) {
        throw result.error;
      }

      // Return in format expected by deprecated hooks
      const user = result.data?.user;
      if (!user?.id) {
        throw new Error("Failed to create user");
      }

      return {
        userId: user.id,
        user,
      };
    },
  });
}
