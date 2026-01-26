import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePermissions } from "@/hooks/use-permissions";
import { authClient } from "@/features/auth/lib/auth/client";

vi.mock("@/features/auth/lib/auth/client", () => ({
  authClient: {
    useSession: vi.fn(),
    admin: {
      checkRolePermission: vi.fn(),
    },
  },
}));

describe("usePermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return loading state when session is pending", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    } as never);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: true,
    });
  });

  it("should return loading state when session is null", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    } as never);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: true,
    });
  });

  it("should return permissions for admin user", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: "admin",
        },
      },
      isPending: false,
      error: null,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockReturnValue(true);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canManageUsers: true,
      canViewAdmin: true,
      loading: false,
    });

    expect(authClient.admin.checkRolePermission).toHaveBeenCalledWith({
      role: "admin",
      permissions: {
        user: ["list"],
      },
    });
  });

  it("should return permissions for regular user", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: "user",
        },
      },
      isPending: false,
      error: null,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockReturnValue(false);

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: false,
    });
  });

  it("should handle errors gracefully", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: "user",
        },
      },
      isPending: false,
      error: null,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockImplementation(() => {
      throw new Error("Permission check failed");
    });

    // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress console.error in tests
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => usePermissions());

    expect(result.current).toEqual({
      canManageUsers: false,
      canViewAdmin: false,
      loading: false,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to check permissions:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should default to user role when role is undefined", () => {
    vi.mocked(authClient.useSession).mockReturnValue({
      data: {
        user: {
          id: "1",
          role: undefined,
        },
      },
      isPending: false,
      error: null,
    } as never);

    vi.mocked(authClient.admin.checkRolePermission).mockReturnValue(false);

    const { result } = renderHook(() => usePermissions());

    expect(authClient.admin.checkRolePermission).toHaveBeenCalledWith({
      role: "user",
      permissions: {
        user: ["list"],
      },
    });

    expect(result.current.loading).toBe(false);
  });
});
