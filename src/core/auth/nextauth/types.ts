import 'next-auth';

/**
 * Extend NextAuth types to match our JWTUserData structure
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    accessToken?: string;
    provider?: string;
  }
}

/**
 * @name JWTUserData
 * @description The user data mapped from the JWT claims.
 * This is kept for backward compatibility with existing code.
 */
export type JWTUserData = {
  is_anonymous: boolean;
  aal: `aal1` | `aal2`;
  email: string;
  phone: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  id: string;
  amr: Array<{
    method: string;
    timestamp: number;
  }>;
};

