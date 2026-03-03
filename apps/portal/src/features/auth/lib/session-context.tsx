"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

import { authClient } from "./client";

/**
 * Session context value
 */
interface SessionContextValue {
  session: ReturnType<typeof authClient.useSession>["data"];
  isPending: boolean;
  permissions: {
    canManageUsers: boolean;
    canViewAdmin: boolean;
    loading: boolean;
  };
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

/**
 * Session Provider Component
 * Fetches session once and provides it to all child components via context.
 * This consolidates session usage to a single query instead of multiple hooks.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  // Single source of truth for session data
  const { data: session, isPending } = authClient.useSession();

  // Compute permissions once and share via context
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

  const value = useMemo(
    () => ({
      session,
      isPending,
      permissions,
    }),
    [session, isPending, permissions]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Hook to access session data from context
 * Use this instead of authClient.useSession() directly
 */
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

/**
 * Hook to access permissions from context
 * Use this instead of usePermissions() hook
 */
export function usePermissions() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a SessionProvider");
  }
  return context.permissions;
}
