"use client";

import { useQueryStates } from "nuqs";

import { usersListParsers } from "@/features/admin/lib/search-params";

/**
 * Encapsulates users list URL state (role, banned, search, limit, offset).
 * All components using this hook share the same URL keys and stay in sync.
 * See nuqs tips & tricks: reuse via custom hook.
 */
export function useUsersListSearchParams() {
  return useQueryStates(usersListParsers);
}
