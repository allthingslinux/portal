"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/features/auth/lib/auth/client";
import { queryKeys } from "@/shared/api/query-keys";
import { QUERY_CACHE } from "@/shared/utils/constants";

// ============================================================================
// Session Management Hooks
// ============================================================================
// TanStack Query hooks wrapping Better Auth session management methods

/**
 * List all device sessions (multi-session plugin)
 * Returns all active sessions for the current user across devices
 */
export function useDeviceSessions() {
  return useQuery({
    queryKey: [...queryKeys.sessions.current(), "devices"],
    queryFn: async () => {
      const result = await authClient.multiSession.listDeviceSessions({});
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? [];
    },
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

/**
 * List all sessions for current user
 * Returns all active sessions (Better Auth core method)
 */
export function useSessionsList() {
  return useQuery({
    queryKey: queryKeys.sessions.current(),
    queryFn: async () => {
      const sessions = await authClient.listSessions();
      return sessions ?? [];
    },
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

/**
 * Set active session (multi-session plugin)
 * Switches the active session to a different account
 */
export function useSetActiveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await authClient.multiSession.setActive({
        sessionToken,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate all session-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      // Invalidate current user (session change might affect user)
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.current(),
      });
    },
  });
}

/**
 * Revoke a device session (multi-session plugin)
 */
export function useRevokeDeviceSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await authClient.multiSession.revoke({
        sessionToken,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate device sessions list
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.sessions.current(), "devices"],
      });
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.current(),
      });
    },
  });
}

/**
 * Revoke a specific session
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      await authClient.revokeSession({ token });
    },
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.current(),
      });
      // Invalidate device sessions
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.sessions.current(), "devices"],
      });
    },
  });
}

/**
 * Revoke all other sessions (except current)
 */
export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.revokeOtherSessions();
    },
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.current(),
      });
      // Invalidate device sessions
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.sessions.current(), "devices"],
      });
    },
  });
}

/**
 * Revoke all sessions (including current)
 */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.revokeSessions();
    },
    onSuccess: () => {
      // Invalidate all session-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.all,
      });
      // Invalidate current user (will be logged out)
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.current(),
      });
    },
  });
}
