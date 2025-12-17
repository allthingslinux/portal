"use client";

import { useMutation } from "@tanstack/react-query";

type UpdateUserParams = {
  email?: string;
  password?: string;
  redirectTo?: string;
};

/**
 * Hook for updating user email or password
 * Migrated from Supabase to Better Auth
 */
export function useUpdateUser() {
  return useMutation({
    mutationFn: async (params: UpdateUserParams) => {
      const baseURL =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const apiPath = "/api/auth";

      if (params.email) {
        // Better Auth uses updateEmail API endpoint
        const response = await fetch(`${baseURL}${apiPath}/update-email`, {
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
            .catch(() => ({ message: "Failed to update email" }));
          throw new Error(error.message || "Failed to update email");
        }

        const data = await response.json();
        return { data, error: null };
      }

      if (params.password) {
        // Better Auth uses updatePassword API endpoint
        const response = await fetch(`${baseURL}${apiPath}/update-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: params.password,
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response
            .json()
            .catch(() => ({ message: "Failed to update password" }));
          throw new Error(error.message || "Failed to update password");
        }

        const data = await response.json();
        return { data, error: null };
      }

      throw new Error("Either email or password must be provided");
    },
  });
}
