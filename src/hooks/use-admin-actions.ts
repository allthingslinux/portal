"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/query-keys";
import { authClient } from "@/lib/auth/client";

// ============================================================================
// Admin Action Hooks
// ============================================================================
// TanStack Query hooks wrapping Better Auth admin methods
// These are for admin-only actions that use Better Auth's admin plugin

/**
 * Set user role mutation
 */
export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "staff" | "admin";
    }) => {
      const result = await authClient.admin.setRole({
        userId,
        role,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats(),
      });
      toast.success("User role updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });
}

/**
 * Ban user mutation
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      banReason,
    }: {
      userId: string;
      banReason?: string;
    }) => {
      const result = await authClient.admin.banUser({
        userId,
        banReason: banReason || "Banned by admin",
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats(),
      });
      toast.success("User banned");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ban user");
    },
  });
}

/**
 * Unban user mutation
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.unbanUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: (_, userId) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats(),
      });
      toast.success("User unbanned");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unban user");
    },
  });
}

/**
 * Impersonate user mutation
 */
export function useImpersonateUser() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.impersonateUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Now impersonating user");
      // Redirect after successful impersonation using Next.js router
      router.push("/app");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to impersonate user");
    },
  });
}
