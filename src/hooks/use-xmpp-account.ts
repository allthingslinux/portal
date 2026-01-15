"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import {
  createXmppAccount,
  deleteXmppAccount,
  fetchXmppAccount,
  fetchXmppAccountById,
  updateXmppAccount,
} from "@/lib/api/xmpp";
import type {
  CreateXmppAccountRequest,
  UpdateXmppAccountRequest,
} from "@/lib/xmpp/types";

// ============================================================================
// XMPP Account Hooks
// ============================================================================
// TanStack Query hooks for XMPP account management

/**
 * Fetch current user's XMPP account
 */
export function useXmppAccount() {
  return useQuery({
    queryKey: queryKeys.xmppAccounts.current(),
    queryFn: fetchXmppAccount,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch a specific XMPP account by ID
 */
export function useXmppAccountById(id: string) {
  return useQuery({
    queryKey: queryKeys.xmppAccounts.detail(id),
    queryFn: () => fetchXmppAccountById(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create a new XMPP account for the current user
 */
export function useCreateXmppAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateXmppAccountRequest) => createXmppAccount(data),
    onSuccess: () => {
      // Invalidate current account query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.xmppAccounts.current(),
      });
    },
  });
}

/**
 * Update an XMPP account
 */
export function useUpdateXmppAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateXmppAccountRequest;
    }) => updateXmppAccount(id, data),
    onSuccess: (data, variables) => {
      // Update specific account in cache
      queryClient.setQueryData(
        queryKeys.xmppAccounts.detail(variables.id),
        data
      );
      // Invalidate current account query
      queryClient.invalidateQueries({
        queryKey: queryKeys.xmppAccounts.current(),
      });
    },
  });
}

/**
 * Delete an XMPP account
 */
export function useDeleteXmppAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteXmppAccount(id),
    onSuccess: () => {
      // Invalidate all XMPP account queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.xmppAccounts.all,
      });
    },
  });
}
