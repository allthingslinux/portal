"use client";

import { authClient } from "~/lib/auth";
import type { BetterAuthUser } from "~/lib/auth/types";

/**
 * Hook to get the current user session
 */
export function useSession() {
  const {
    data: session,
    error,
    isPending,
    isRefetching,
    refetch,
  } = authClient.useSession();

  const user: BetterAuthUser | undefined = session?.user;

  return {
    data: user,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
    refetch,
    isRefetching,
  };
}
