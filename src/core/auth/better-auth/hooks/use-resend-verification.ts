"use client";

import { useMutation } from "@tanstack/react-query";

type ResendVerificationParams = {
  email: string;
  redirectPath?: string;
  captchaToken?: string;
};

/**
 * Hook for resending verification email
 * Migrated from Supabase to Better Auth
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: async (params: ResendVerificationParams) => {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      // Better Auth uses resendEmail API endpoint
      const response = await fetch(`${baseURL}${apiPath}/resend-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: params.email,
          type: "email-verification",
          redirectTo: params.redirectPath,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to resend verification email" }));
        throw new Error(error.message || "Failed to resend verification email");
      }

      const data = await response.json();
      return { data, error: null };
    },
  });
}
