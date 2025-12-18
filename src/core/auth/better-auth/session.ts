import "server-only";

import { headers } from "next/headers";

import { auth } from "./config";
import type { BetterAuthSession, BetterAuthUser } from "./types";

export async function getServerSession(): Promise<BetterAuthSession | null> {
  try {
    const sessionResult = await auth.api.getSession({
      headers: await headers(),
    });

    return sessionResult || null;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("getServerSession error (non-fatal):", error);
    }
    return null;
  }
}

export async function getSessionUserData(): Promise<BetterAuthUser | null> {
  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
}
