"use client";

import { useEffect, useState } from "react";

import { authClient } from "@/auth/client";

export function usePermissions() {
  const [permissions, setPermissions] = useState({
    canManageUsers: false,
    canViewAdmin: false,
    loading: true,
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    const checkPermissions = () => {
      try {
        if (!session) {
          setPermissions({
            canManageUsers: false,
            canViewAdmin: false,
            loading: false,
          });
          return;
        }

        // Check if user can manage users (admin permission)
        const canManageUsers = authClient.admin.checkRolePermission({
          role: (session.user.role || "user") as "user" | "admin",
          permissions: {
            user: ["list"],
          },
        });

        setPermissions({
          canManageUsers,
          canViewAdmin: canManageUsers,
          loading: false,
        });
      } catch (error) {
        console.error("Failed to check permissions:", error);
        setPermissions({
          canManageUsers: false,
          canViewAdmin: false,
          loading: false,
        });
      }
    };

    checkPermissions();
  }, [session]);

  return permissions;
}
