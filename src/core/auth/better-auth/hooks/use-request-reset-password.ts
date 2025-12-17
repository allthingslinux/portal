"use client";

import { useMutation } from "@tanstack/react-query";

type RequestResetPasswordParams = {
  email: string;
  redirectTo?: string;
  captchaToken?: string;
};

/**
 * Hook for requesting a password reset
 * Migrated from Supabase to Better Auth
 */
export function useRequestResetPassword() {
  return useMutation({
    mutationFn: async (params: RequestResetPasswordParams) => {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      // Better Auth uses forgetPassword API endpoint
      const response = await fetch(`${baseURL}${apiPath}/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: params.email,
          redirectTo: params.redirectTo,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Failed to request password reset" }));
        throw new Error(error.message || "Failed to request password reset");
      }

      const data = await response.json();
      return { data, error: null };
    },
  });
}
