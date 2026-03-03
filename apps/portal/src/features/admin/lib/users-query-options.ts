/**
 * Users list query options factory.
 * Shared by useUsers (client) and admin page prefetch (server); queryFn is supplied by each caller.
 */

import { queryKeys } from "@portal/api/query-keys";
import type { UserListFilters } from "@portal/api/types";
import { QUERY_CACHE } from "@portal/utils/constants";
import { keepPreviousData } from "@tanstack/react-query";

export function usersListQueryOptions(filters?: UserListFilters) {
  return {
    queryKey: queryKeys.users.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
    placeholderData: keepPreviousData,
  };
}
