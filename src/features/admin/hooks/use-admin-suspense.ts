"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  deleteSession,
  deleteUser,
  fetchAdminStats,
  fetchApiKeyById,
  fetchApiKeys,
  fetchOAuthClientById,
  fetchOAuthClients,
  fetchSessions,
  fetchUserById,
  fetchUsers,
  updateUser,
} from "@/features/admin/api/admin";
import { queryKeys } from "@/shared/api/query-keys";
import type {
  AdminUserDetailResponse,
  SessionListFilters,
  UpdateUserInput,
  UserListFilters,
} from "@/shared/api/types";
import { QUERY_CACHE } from "@/shared/utils/constants";

// ============================================================================
// Admin Hooks with Suspense
// ============================================================================
// Suspense variants of admin hooks. Use these when you want Suspense behavior:
// - No loading states needed (Suspense handles it)
// - Errors thrown to Error Boundary
// - Data is guaranteed to be defined
//
// Usage:
//   <Suspense fallback={<Loading />}>
//     <ComponentUsingSuspenseHook />
//   </Suspense>

// Users
export function useUsersSuspense(filters?: UserListFilters) {
  return useSuspenseQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useUserSuspense(userId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUserById(userId),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useUpdateUserSuspense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: (data, variables) => {
      // Merge updated user into existing user detail cache (preserve ircAccount, xmppAccount)
      queryClient.setQueryData<AdminUserDetailResponse>(
        queryKeys.users.detail(variables.id),
        (prev) =>
          prev
            ? { ...prev, user: data }
            : { user: data, ircAccount: null, xmppAccount: null }
      );
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    // Propagate errors to Error Boundary
    throwOnError: true,
  });
}

export function useDeleteUserSuspense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      // Remove deleted user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    throwOnError: true,
  });
}

// Sessions
export function useSessionsSuspense(filters?: SessionListFilters) {
  return useSuspenseQuery({
    queryKey: queryKeys.sessions.list(filters),
    queryFn: () => fetchSessions(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useDeleteSessionSuspense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: (_, sessionId) => {
      // Remove deleted session from cache
      queryClient.removeQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
    throwOnError: true,
  });
}

// Stats
export function useAdminStatsSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: fetchAdminStats,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

// Multiple queries in parallel with Suspense
export function useAdminDashboardSuspense() {
  return useSuspenseQueries({
    queries: [
      {
        queryKey: queryKeys.admin.stats(),
        queryFn: fetchAdminStats,
        staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
      },
      {
        queryKey: queryKeys.users.list({ limit: 50 }),
        queryFn: () => fetchUsers({ limit: 50 }),
        staleTime: QUERY_CACHE.STALE_TIME_SHORT,
      },
      {
        queryKey: queryKeys.sessions.list({ limit: 100 }),
        queryFn: () => fetchSessions({ limit: 100 }),
        staleTime: QUERY_CACHE.STALE_TIME_SHORT,
      },
    ],
  });
}

// API Keys (admin)
export function useAdminApiKeysSuspense(filters?: {
  userId?: string;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useSuspenseQuery({
    queryKey: queryKeys.apiKeys.list(filters?.userId),
    queryFn: () => fetchApiKeys(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useAdminApiKeySuspense(keyId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.apiKeys.detail(keyId),
    queryFn: () => fetchApiKeyById(keyId),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

// OAuth Clients (admin)
export function useAdminOAuthClientsSuspense(filters?: {
  userId?: string;
  disabled?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useSuspenseQuery({
    queryKey: queryKeys.oauthClients.list(filters),
    queryFn: () => fetchOAuthClients(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useAdminOAuthClientSuspense(clientId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.oauthClients.detail(clientId),
    queryFn: () => fetchOAuthClientById(clientId),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}
