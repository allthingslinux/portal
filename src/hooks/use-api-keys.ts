"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import type { CreateApiKeyInput, UpdateApiKeyInput } from "@/lib/api/types";
import { authClient } from "@/lib/auth/client";

// ============================================================================
// API Key Hooks (User-facing)
// ============================================================================
// TanStack Query hooks wrapping Better Auth API key client methods
// These are for the current user's API keys

/**
 * Fetch current user's API keys
 */
export function useApiKeys() {
  return useQuery({
    queryKey: queryKeys.apiKeys.list(),
    queryFn: async () => {
      const result = await authClient.apiKey.list({});
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch a single API key by ID (current user's keys only)
 */
export function useApiKey(keyId: string) {
  return useQuery({
    queryKey: queryKeys.apiKeys.detail(keyId),
    queryFn: async () => {
      // Better Auth client expects query object structure
      const result = await authClient.apiKey.get({ query: { id: keyId } });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? null;
    },
    enabled: !!keyId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Create a new API key
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      const result = await authClient.apiKey.create({
        name: input.name,
        prefix: input.prefix,
        expiresIn: input.expiresAt
          ? Math.floor(
              (new Date(input.expiresAt).getTime() - Date.now()) / 1000
            )
          : undefined,
        metadata: input.metadata ? JSON.parse(input.metadata) : undefined,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate API keys list
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.lists() });
    },
  });
}

/**
 * Update an API key
 */
export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      keyId,
      data,
    }: {
      keyId: string;
      data: UpdateApiKeyInput;
    }) => {
      const result = await authClient.apiKey.update({
        keyId,
        name: data.name,
        enabled: data.enabled,
        // Note: Better Auth might not support all these fields in update
        // Adjust based on actual API
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update specific API key in cache
      queryClient.setQueryData(queryKeys.apiKeys.detail(variables.keyId), data);
      // Invalidate API keys list
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.lists() });
    },
  });
}

/**
 * Delete an API key
 */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      const result = await authClient.apiKey.delete({ keyId });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (_, keyId) => {
      // Remove deleted API key from cache
      queryClient.removeQueries({
        queryKey: queryKeys.apiKeys.detail(keyId),
      });
      // Invalidate API keys list
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.lists() });
    },
  });
}

/**
 * Verify an API key
 * Note: Better Auth client may not have verify method available.
 * If needed, implement via custom API endpoint that calls auth.api.verifyApiKey()
 */
export function useVerifyApiKey() {
  return useMutation({
    mutationFn: async ({
      key,
      permissions,
    }: {
      key: string;
      permissions?: Record<string, string[]>;
    }) => {
      // Use fetch to call the verify endpoint directly since client method may not be available
      const response = await fetch("/api/auth/api-key/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          permissions,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          error.error?.message ||
            `Failed to verify API key: ${response.statusText}`
        );
      }

      return response.json();
    },
  });
}
