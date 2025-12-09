import { getSessionUserData } from "~/core/auth/better-auth/session";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";

const SIGN_IN_PATH = "/auth/sign-in";

/**
 * @name requireUser
 * @description Require a session to be present in the request
 * @param options
 * @param options.next
 */
export async function requireUser(options?: { next?: string }): Promise<
  | {
      error: null;
      data: BetterAuthUser;
    }
  | {
      error: AuthenticationError;
      data: null;
      redirectTo: string;
    }
> {
  const userData = await getSessionUserData();

  if (!userData) {
    return {
      data: null,
      error: new AuthenticationError(),
      redirectTo: getRedirectTo(SIGN_IN_PATH, options?.next),
    };
  }

  return {
    error: null,
    data: userData,
  };
}

class AuthenticationError extends Error {
  constructor() {
    super("Authentication required");
  }
}

function getRedirectTo(path: string, next?: string) {
  return path + (next ? `?next=${next}` : "");
}
