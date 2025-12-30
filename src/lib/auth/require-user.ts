import "server-only";

import { redirect } from "next/navigation";

import { getServerSession } from "./session";

/**
 * Require user to be authenticated, redirect to sign-in if not
 * Migrated from NextAuth
 */
export async function requireUser() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return session.user;
}
