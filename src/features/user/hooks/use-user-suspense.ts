"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  fetchCurrentUser,
  fetchMySessions,
  updateCurrentUser,
} from "@/features/user/api/user";
import { queryKeys } from "@/shared/api/query-keys";
import type { UpdateUserInput } from "@/shared/api/types";
import { QUERY_CACHE } from "@/shared/utils/constants";

// ============================================================================
// User Hooks with Suspense
// ============================================================================
// Suspense variants of user hooks. Use these when you want Suspense behavior:
// - No loading states needed (Suspense handles it)
// - Errors thrown to Error Boundary
// - Data is guaranteed to be defined
//
// Usage:
//   <Suspense fallback={<Loading />}>
//     <ComponentUsingSuspenseHook />
//   </Suspense>

/**
 * Fetch current authenticated user's profile (Suspense)
 */
export function useCurrentUserSuspense() {
  return useSuspenseQuery({
    queryKey: queryKeys.users.current(),
    queryFn: fetchCurrentUser,
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

/**
 * Update current user's profile (Suspense)
 */
export function useUpdateCurrentUserSuspense() {
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
    // Propagate errors to Error Boundary
    throwOnError: true,
  });
}

/**
 * Fetch current user's sessions (Suspense)
 */
export function useMySessionsSuspense(filters?: { active?: boolean }) {
  return useSuspenseQuery({
    queryKey: [...queryKeys.sessions.current(), { filters }],
    queryFn: () => fetchMySessions(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}
