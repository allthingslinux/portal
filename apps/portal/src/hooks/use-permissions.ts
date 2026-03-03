"use client";

/**
 * @deprecated Use usePermissions() from @/auth/session-context instead
 * This hook is kept for backward compatibility but now delegates to the context.
 * The context version consolidates session usage to a single query.
 */
import { usePermissions as usePermissionsFromContext } from "@/auth/session-context";

export function usePermissions() {
  // Delegate to context-based hook for consolidated session usage
  return usePermissionsFromContext();
}
