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
  fetchOAuthClientById,
  fetchOAuthClients,
  fetchSessionById,
  fetchSessions,
  fetchUserById,
  fetchUsers,
  updateUser,
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  SessionListFilters,
  UpdateUserInput,
  UserListFilters,
} from "@/lib/api/types";

// ============================================================================
// Admin Hooks
// ============================================================================
// TanStack Query hooks for admin operations

// Users
export function useUsers(filters?: UserListFilters) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUpdateUser() {
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
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId),
    queryFn: () => fetchSessionById(sessionId),
    enabled: !!sessionId,
    staleTime: 60 * 1000, // 1 minute
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
    staleTime: 60 * 1000, // 1 minute
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
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAdminApiKey(keyId: string) {
  return useQuery({
    queryKey: queryKeys.apiKeys.detail(keyId),
    queryFn: () => fetchApiKeyById(keyId),
    enabled: !!keyId,
    staleTime: 60 * 1000, // 1 minute
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
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAdminOAuthClient(clientId: string) {
  return useQuery({
    queryKey: queryKeys.oauthClients.detail(clientId),
    queryFn: () => fetchOAuthClientById(clientId),
    enabled: !!clientId,
    staleTime: 60 * 1000, // 1 minute
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
