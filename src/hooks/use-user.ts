"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import type { UpdateUserInput } from "@/lib/api/types";
import {
  fetchCurrentUser,
  fetchMySessions,
  updateCurrentUser,
} from "@/lib/api/user";

// ============================================================================
// User Hooks
// ============================================================================
// TanStack Query hooks for current user operations

/**
 * Fetch current authenticated user's profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: fetchCurrentUser,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Update current user's profile
 */
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Pick<UpdateUserInput, "name">) =>
      updateCurrentUser(data),
    onSuccess: (data) => {
      // Update current user in cache
      queryClient.setQueryData(queryKeys.users.current(), data);
      // Also update if user detail is cached
      queryClient.setQueryData(queryKeys.users.detail(data.id), data);
      // Invalidate users list (in case it shows current user)
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
}

/**
 * Fetch current user's sessions
 */
export function useMySessions(filters?: { active?: boolean }) {
  return useQuery({
    queryKey: [...queryKeys.sessions.current(), { filters }],
    queryFn: () => fetchMySessions(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}
