/**
 * Better Auth user type
 * This replaces JWTUserData and represents the user from Better Auth
 */
export type BetterAuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Better Auth session type
 */
export type BetterAuthSession = {
  user: BetterAuthUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};
