"use client";

import { authClient } from "../client";
import type { BetterAuthUser } from "../types";

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
