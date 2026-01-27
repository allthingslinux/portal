import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";

// ============================================================================
// Server-Side Role Checking Utility
// ============================================================================
// Utility functions for checking user roles on the server side.
// These functions query the database to get the user's role since the
// session object from auth.api.getSession() may not include the role field
// in its type definition.

/**
 * Get user's role from database
 * @param userId - The user ID to check
 * @returns The user's role or "user" if not found
 */
export async function getUserRole(userId: string): Promise<string> {
  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return dbUser?.role || "user";
}

/**
 * Check if user has admin or staff role
 * @param userId - The user ID to check
 * @returns True if user is admin or staff, false otherwise
 */
export async function isAdminOrStaff(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin" || role === "staff";
}

/**
 * Check if user has admin role
 * @param userId - The user ID to check
 * @returns True if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === "admin";
}
