import "server-only";

import { headers } from "next/headers";

import { auth } from "./config";
import type { BetterAuthSession, BetterAuthUser } from "./types";

/**
 * Get the current session from Better Auth (server-side)
 */
export async function getServerSession(): Promise<BetterAuthSession | null> {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  return result || null;
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
