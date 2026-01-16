"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createIntegrationAccount,
  deleteIntegrationAccount,
  fetchIntegrationAccount,
  fetchIntegrationAccountById,
  fetchIntegrations,
  updateIntegrationAccount,
} from "@/lib/api/integrations";
import { queryKeys } from "@/lib/api/query-keys";

/**
 * Fetch available integrations.
 */
export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations.list(),
    queryFn: fetchIntegrations,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch current user's integration account.
 */
export function useIntegrationAccount<TAccount>(integrationId: string) {
  return useQuery({
    queryKey: queryKeys.integrations.accounts.current(integrationId),
    queryFn: () => fetchIntegrationAccount<TAccount>(integrationId),
    enabled: !!integrationId,
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch a specific integration account by ID.
 */
export function useIntegrationAccountById<TAccount>(
  integrationId: string,
  id: string
) {
  return useQuery({
    queryKey: queryKeys.integrations.accounts.detail(integrationId, id),
    queryFn: () => fetchIntegrationAccountById<TAccount>(integrationId, id),
    enabled: !!integrationId && !!id,
    staleTime: 60 * 1000,
  });
}

/**
 * Create a new integration account for the current user.
 */
export function useCreateIntegrationAccount<TAccount>(integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      createIntegrationAccount<TAccount>(integrationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.accounts.current(integrationId),
      });
    },
  });
}

/**
 * Update an integration account.
 */
export function useUpdateIntegrationAccount<TAccount>(integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Record<string, unknown>;
    }) => updateIntegrationAccount<TAccount>(integrationId, id, input),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.integrations.accounts.detail(integrationId, variables.id),
        data
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.accounts.current(integrationId),
      });
    },
  });
}

/**
 * Delete an integration account.
 */
export function useDeleteIntegrationAccount(integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIntegrationAccount(integrationId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.accounts.all(integrationId),
      });
    },
  });
}
