"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";

import type {
  SessionListFilters,
  UpdateUserInput,
  UserListFilters,
} from "@/lib/api";
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
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/query-keys";

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
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUserSuspense(userId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUserById(userId),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUpdateUserSuspense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: (data, variables) => {
      // Update specific user in cache
      queryClient.setQueryData(queryKeys.users.detail(variables.id), data);
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
    staleTime: 30 * 1000, // 30 seconds
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
    staleTime: 60 * 1000, // 1 minute
  });
}

// Multiple queries in parallel with Suspense
export function useAdminDashboardSuspense() {
  return useSuspenseQueries({
    queries: [
      {
        queryKey: queryKeys.admin.stats(),
        queryFn: fetchAdminStats,
        staleTime: 60 * 1000,
      },
      {
        queryKey: queryKeys.users.list({ limit: 50 }),
        queryFn: () => fetchUsers({ limit: 50 }),
        staleTime: 30 * 1000,
      },
      {
        queryKey: queryKeys.sessions.list({ limit: 100 }),
        queryFn: () => fetchSessions({ limit: 100 }),
        staleTime: 30 * 1000,
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
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAdminApiKeySuspense(keyId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.apiKeys.detail(keyId),
    queryFn: () => fetchApiKeyById(keyId),
    staleTime: 60 * 1000, // 1 minute
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
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAdminOAuthClientSuspense(clientId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.oauthClients.detail(clientId),
    queryFn: () => fetchOAuthClientById(clientId),
    staleTime: 60 * 1000, // 1 minute
  });
}
