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
 * Fetches the current user's XMPP account.
 *
 * @returns The React Query result containing the current user's XMPP account data
 */
export function useXmppAccount() {
  return useQuery({
    queryKey: queryKeys.xmppAccounts.current(),
    queryFn: fetchXmppAccount,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Provides a React Query hook that fetches an XMPP account by its ID.
 *
 * The query will not run when `id` is falsy and considers fetched data fresh for 1 minute.
 *
 * @param id - The XMPP account identifier
 * @returns The query result containing the XMPP account data; `data` is `undefined` while loading or when `id` is falsy.
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
 * Creates a new XMPP account for the current user.
 *
 * @returns The mutation object used to create an XMPP account. Invoking the mutation sends the create request and, on success, invalidates the cached current XMPP account to trigger a refetch.
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
 * Create a React Query mutation hook to update an XMPP account and keep related caches in sync.
 *
 * On successful mutation the hook sets the returned account data into the detail cache for the
 * updated account id and invalidates the current XMPP account query to trigger a refetch.
 *
 * @returns A mutation result for performing XMPP account updates; the mutation function expects
 * an object `{ id, data }` and resolves to the updated account data.
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
 * Provides a React Query mutation hook to delete an XMPP account and keep related caches in sync.
 *
 * @returns A mutation object whose mutate/mutateAsync function accepts an XMPP account `id` (string) and, on success, invalidates XMPP account queries so related data is refetched.
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