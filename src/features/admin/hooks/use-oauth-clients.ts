"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authClient } from "@/features/auth/lib/auth/client";
import { queryKeys } from "@/shared/api/query-keys";
import { QUERY_CACHE } from "@/shared/utils/constants";

// ============================================================================
// OAuth Client Hooks (User-facing)
// ============================================================================
// TanStack Query hooks wrapping Better Auth OAuth client methods
// These are for the current user's OAuth clients

/**
 * Fetch current user's OAuth clients
 */
export function useOAuthClients() {
  return useQuery({
    queryKey: queryKeys.oauthClients.list(),
    queryFn: async () => {
      const result = await authClient.oauth2.getClients({});
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? [];
    },
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

/**
 * Fetch a single OAuth client by client_id (current user's clients only)
 */
export function useOAuthClient(clientId: string) {
  return useQuery({
    queryKey: queryKeys.oauthClients.detail(clientId),
    queryFn: async () => {
      const result = await authClient.oauth2.getClient({
        query: { client_id: clientId },
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? null;
    },
    enabled: !!clientId,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

/**
 * Get public client information (for consent/login pages)
 */
export function useOAuthClientPublic(clientId: string) {
  return useQuery({
    queryKey: [...queryKeys.oauthClients.detail(clientId), "public"],
    queryFn: async () => {
      const result = await authClient.oauth2.publicClient({
        query: { client_id: clientId },
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data ?? null;
    },
    enabled: !!clientId,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

/**
 * Update an OAuth client
 */
export function useUpdateOAuthClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      client_id,
      update,
    }: {
      client_id: string;
      update: Partial<{
        name: string;
        redirect_uris: string[];
        scopes: string[];
        grant_types: (
          | "refresh_token"
          | "authorization_code"
          | "client_credentials"
        )[];
        response_types: string[];
        [key: string]: unknown;
      }>;
    }) => {
      // Type-safe update object
      const typedUpdate: Parameters<
        typeof authClient.oauth2.updateClient
      >[0]["update"] = {
        ...(update.name && { client_name: update.name }),
        ...(update.redirect_uris && { redirect_uris: update.redirect_uris }),
        ...(update.scopes && { scope: update.scopes.join(" ") }),
        ...(update.grant_types && {
          grant_types: update.grant_types as (
            | "refresh_token"
            | "authorization_code"
            | "client_credentials"
          )[],
        }),
        ...(update.response_types && {
          response_types: update.response_types as "code"[],
        }),
      };

      const result = await authClient.oauth2.updateClient({
        client_id,
        update: typedUpdate,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (data, variables) => {
      // Update specific OAuth client in cache
      queryClient.setQueryData(
        queryKeys.oauthClients.detail(variables.client_id),
        data
      );
      // Invalidate OAuth clients list
      queryClient.invalidateQueries({
        queryKey: queryKeys.oauthClients.lists(),
      });
    },
  });
}

/**
 * Rotate OAuth client secret
 */
export function useRotateOAuthClientSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client_id: string) => {
      const result = await authClient.oauth2.client.rotateSecret({
        client_id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (data, client_id) => {
      // Update OAuth client in cache with new secret (if returned)
      queryClient.setQueryData(queryKeys.oauthClients.detail(client_id), data);
      // Invalidate OAuth clients list
      queryClient.invalidateQueries({
        queryKey: queryKeys.oauthClients.lists(),
      });
    },
  });
}

/**
 * Delete an OAuth client
 */
export function useDeleteOAuthClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client_id: string) => {
      const result = await authClient.oauth2.deleteClient({ client_id });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (_, client_id) => {
      // Remove deleted OAuth client from cache
      queryClient.removeQueries({
        queryKey: queryKeys.oauthClients.detail(client_id),
      });
      // Invalidate OAuth clients list
      queryClient.invalidateQueries({
        queryKey: queryKeys.oauthClients.lists(),
      });
    },
  });
}
