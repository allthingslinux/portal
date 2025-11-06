import type { AMREntry, SupabaseClient } from '@supabase/supabase-js';

import { checkRequiresMultiFactorAuthentication } from './check-requires-mfa';
import { JWTUserData } from './types';

const MULTI_FACTOR_AUTH_VERIFY_PATH = '/auth/verify';
const SIGN_IN_PATH = '/auth/sign-in';

/**
 * @name UserClaims
 * @description The user claims returned from the Supabase auth API.
 */
type UserClaims = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  role: string;
  aal: `aal1` | `aal2`;
  session_id: string;
  is_anonymous: boolean;
  amr: AMREntry[];
};

/**
 * @name requireUser
 * @description Require a session to be present in the request
 * @param client
 * @param options
 * @param options.verifyMfa
 * @param options.next
 */
export async function requireUser(
  client: SupabaseClient,
  options?: {
    verifyMfa?: boolean;
    next?: string;
  },
): Promise<
  | {
      error: null;
      data: JWTUserData;
    }
  | (
      | {
          error: AuthenticationError;
          data: null;
          redirectTo: string;
        }
      | {
          error: MultiFactorAuthError;
          data: null;
          redirectTo: string;
        }
    )
> {
  const { data, error } = await client.auth.getClaims();

  if (!data?.claims || error) {
    return {
      data: null,
      error: new AuthenticationError(),
      redirectTo: getRedirectTo(SIGN_IN_PATH, options?.next),
    };
  }

  const { verifyMfa = true } = options ?? {};

  if (verifyMfa) {
    const requiresMfa = await checkRequiresMultiFactorAuthentication(client);

    // If the user requires multi-factor authentication,
    // redirect them to the page where they can verify their identity.
    if (requiresMfa) {
      return {
        data: null,
        error: new MultiFactorAuthError(),
        redirectTo: getRedirectTo(MULTI_FACTOR_AUTH_VERIFY_PATH, options?.next),
      };
    }
  }

  // the client doesn't type the claims, so we need to cast it to the User type
  const user = data.claims as UserClaims;

  return {
    error: null,
    data: {
      is_anonymous: user.is_anonymous,
      aal: user.aal,
      email: user.email,
      phone: user.phone,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
      id: user.sub,
      amr: user.amr,
    },
  };
}

class AuthenticationError extends Error {
  constructor() {
    super(`Authentication required`);
  }
}

export class MultiFactorAuthError extends Error {
  constructor() {
    super(`Multi-factor authentication required`);
  }
}

function getRedirectTo(path: string, next?: string) {
  return path + (next ? `?next=${next}` : '');
}
