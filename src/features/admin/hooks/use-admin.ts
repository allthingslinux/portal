"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteApiKey,
  deleteOAuthClient,
  deleteSession,
  deleteUser,
  fetchAdminStats,
  fetchApiKeyById,
  fetchApiKeys,
  fetchIrcAccounts,
  fetchOAuthClientById,
  fetchOAuthClients,
  fetchSessionById,
  fetchSessions,
  fetchUserById,
  fetchUsers,
  updateUser,
} from "@/features/admin/api/admin";
import { usersListQueryOptions } from "@/features/admin/lib/users-query-options";
import { queryKeys } from "@/shared/api/query-keys";
import type {
  AdminUserDetailResponse,
  SessionListFilters,
  UpdateUserInput,
  UserListFilters,
} from "@/shared/api/types";
import { QUERY_CACHE } from "@/shared/utils/constants";

// ============================================================================
// Admin Hooks
// ============================================================================
// TanStack Query hooks for admin operations

// Users
export function useUsers(filters?: UserListFilters) {
  return useQuery({
    ...usersListQueryOptions(filters),
    queryFn: () => fetchUsers(filters),
  });
}

export function useUser(userId: string | null) {
  return useQuery<AdminUserDetailResponse, Error>({
    queryKey: queryKeys.users.detail(userId ?? ""),
    queryFn: () => {
      if (!userId) {
        throw new Error("No userId");
      }
      return fetchUserById(userId);
    },
    enabled: !!userId,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: (data, variables) => {
      // Merge updated user into existing user detail cache (preserve ircAccount, xmppAccount)
      // Only merge when prev exists; avoid creating incomplete cache entries with null integrations
      queryClient.setQueryData<AdminUserDetailResponse>(
        queryKeys.users.detail(variables.id),
        (prev) =>
          prev
            ? ({
                ...prev,
                user: data as unknown as AdminUserDetailResponse["user"],
              } as AdminUserDetailResponse)
            : undefined
      );
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useDeleteUser() {
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
  });
}

// Sessions
export function useSessions(filters?: SessionListFilters) {
  return useQuery({
    queryKey: queryKeys.sessions.list(filters),
    queryFn: () => fetchSessions(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: () => fetchSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useDeleteSession() {
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
  });
}

// Stats
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: fetchAdminStats,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

// API Keys (Admin - all users)
export function useAdminApiKeys(filters?: {
  userId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.apiKeys.list(filters?.userId),
    queryFn: () => fetchApiKeys(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useAdminApiKey(keyId: string) {
  return useQuery({
    queryKey: queryKeys.apiKeys.detail(keyId),
    queryFn: () => fetchApiKeyById(keyId),
    enabled: !!keyId,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useDeleteAdminApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: (_data, keyId) => {
      // Remove deleted API key from cache
      queryClient.removeQueries({
        queryKey: queryKeys.apiKeys.detail(keyId),
      });
      // Invalidate API keys list
      queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

// OAuth Clients (Admin - all users)
export function useAdminOAuthClients(filters?: {
  userId?: string;
  disabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.oauthClients.list(filters),
    queryFn: () => fetchOAuthClients(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useAdminOAuthClient(clientId: string) {
  return useQuery({
    queryKey: queryKeys.oauthClients.detail(clientId),
    queryFn: () => fetchOAuthClientById(clientId),
    enabled: !!clientId,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useDeleteAdminOAuthClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOAuthClient,
    onSuccess: (_data, clientId) => {
      // Remove deleted OAuth client from cache
      queryClient.removeQueries({
        queryKey: queryKeys.oauthClients.detail(clientId),
      });
      // Invalidate OAuth clients list
      queryClient.invalidateQueries({
        queryKey: queryKeys.oauthClients.lists(),
      });
    },
  });
}

// IRC accounts (admin list)
export function useAdminIrcAccounts(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.admin.ircAccounts.list(filters),
    queryFn: () => fetchIrcAccounts(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}
