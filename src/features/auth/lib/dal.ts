import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getUserRole, isAdmin, isAdminOrStaff } from "@/auth/check-role";
import type { SessionData } from "@/shared/types/auth";

// ============================================================================
// Data Access Layer (DAL)
// ============================================================================
// Centralized authorization logic following Next.js 16.1.1 best practices.
// Uses React's cache() API to memoize session verification during a render pass,
// preventing duplicate database requests when verifySession() is called multiple times.
//
// This DAL ensures:
// - Consistent auth checks across pages, route handlers, and server actions
// - Memoization of session verification (only one DB query per render pass)
// - Proper error handling and redirects
// - Security by verifying sessions from the database (not just cookies)

// Re-export for backward compatibility
export type { SessionData } from "@/shared/types/auth";

/**
 * Verify user session and return session data
 * Uses React's cache() to memoize the result during a render pass,
 * preventing duplicate requests when called multiple times in the same render.
 *
 * @returns SessionData if authenticated, otherwise redirects to sign-in
 * @throws Redirects to /auth/sign-in if not authenticated
 */
export const verifySession = cache(async (): Promise<SessionData> => {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return {
    isAuth: true,
    userId: session.user.id,
    session,
  };
});

/**
 * Verify user session and check admin role
 * Uses cache() for memoization and verifies admin role from database.
 *
 * @returns SessionData if authenticated and admin, otherwise redirects
 * @throws Redirects to /auth/sign-in if not authenticated
 * @throws Redirects to /app if not admin
 */
export const verifyAdminSession = cache(async (): Promise<SessionData> => {
  const sessionData = await verifySession();

  // Verify admin role from database
  if (!(await isAdmin(sessionData.userId))) {
    redirect("/app");
  }

  const role = await getUserRole(sessionData.userId);

  return {
    ...sessionData,
    role,
  };
});

/**
 * Verify user session and check admin or staff role
 * Uses cache() for memoization and verifies role from database.
 *
 * @returns SessionData if authenticated and admin/staff, otherwise redirects
 * @throws Redirects to /auth/sign-in if not authenticated
 * @throws Redirects to /app if not admin or staff
 */
export const verifyAdminOrStaffSession = cache(
  async (): Promise<SessionData> => {
    const sessionData = await verifySession();

    // Verify admin or staff role from database
    if (!(await isAdminOrStaff(sessionData.userId))) {
      redirect("/app");
    }

    const role = await getUserRole(sessionData.userId);

    return {
      ...sessionData,
      role,
    };
  }
);

/**
 * Get user data (DTO pattern - returns only necessary fields)
 * Uses verifySession() to ensure user is authenticated.
 *
 * @returns User DTO with only necessary fields, or null if not found
 */
export const getUser = cache(async () => {
  const sessionData = await verifySession();

  try {
    // Import here to avoid circular dependencies
    const { db } = await import("@/db");
    const { user } = await import("@/db/schema/auth");
    const { eq } = await import("drizzle-orm");

    const [userData] = await db
      .select({
        // DTO: Only return necessary fields, not entire user object
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, sessionData.userId))
      .limit(1);

    return userData || null;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
});
