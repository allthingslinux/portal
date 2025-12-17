import "server-only";

import { headers } from "next/headers";

import { auth } from "./config";
import type { BetterAuthSession, BetterAuthUser } from "./types";

/**
 * Get the current session from Better Auth (server-side)
 * Returns null if no session exists (does not throw)
 */
export async function getServerSession(): Promise<BetterAuthSession | null> {
  try {
    const result = await auth.api.getSession({
      headers: await headers(),
    });

    // Better Auth returns { session, user } or null/undefined
    // Handle both cases gracefully - return null if no session
    return result || null;
  } catch (error) {
    // If session check fails, return null (user is not authenticated)
    // This allows public pages to work without authentication
    // Log in development to help debug
    if (process.env.NODE_ENV === "development") {
      console.warn("getServerSession error (non-fatal):", error);
    }
    return null;
  }
}

/**
 * Get the current user from Better Auth session (server-side)
 */
export async function getSessionUserData(): Promise<BetterAuthUser | null> {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
}
