/**
 * Users list query options factory.
 * Shared by useUsers (client) and admin page prefetch (server); queryFn is supplied by each caller.
 */

import { keepPreviousData } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api/query-keys";
import type { UserListFilters } from "@/shared/api/types";
import { QUERY_CACHE } from "@/shared/utils/constants";

export function usersListQueryOptions(filters?: UserListFilters) {
  return {
    queryKey: queryKeys.users.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
    placeholderData: keepPreviousData,
  };
}
