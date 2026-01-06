"use client";

import { useMemo } from "react";

import { authClient } from "@/auth/client";

export function usePermissions() {
  const { data: session, isPending } = authClient.useSession();

  // Compute permissions synchronously based on session data
  // This prevents the delayed appearance of admin links
  const permissions = useMemo(() => {
    // While session is loading, return loading state
    if (isPending || !session?.user) {
      return {
        canManageUsers: false,
        canViewAdmin: false,
        loading: true,
      };
    }

    try {
      // Check if user can manage users (admin permission)
      // Use session.user.role directly, which should be available from Better Auth
      const userRole = session.user.role || "user";
      
      const canManageUsers = authClient.admin.checkRolePermission({
        role: userRole as "user" | "admin" | "staff",
        permissions: {
          user: ["list"],
        },
      });

      return {
        canManageUsers,
        canViewAdmin: canManageUsers,
        loading: false,
      };
    } catch (error) {
      console.error("Failed to check permissions:", error);
      return {
        canManageUsers: false,
        canViewAdmin: false,
        loading: false,
      };
    }
  }, [session, isPending]);

  return permissions;
}
