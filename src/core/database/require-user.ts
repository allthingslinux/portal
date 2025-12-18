import { redirect } from "next/navigation";

import { getSessionUserData } from "~/core/auth/better-auth/session";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";

const SIGN_IN_PATH = "/auth/sign-in";

export async function requireUser(options?: {
  next?: string;
}): Promise<BetterAuthUser> {
  const userData = await getSessionUserData();

  if (!userData) {
    const redirectPath = getRedirectTo(SIGN_IN_PATH, options?.next);
    redirect(redirectPath);
  }

  return userData;
}

function getRedirectTo(path: string, next?: string) {
  return path + (next ? `?next=${next}` : "");
}
