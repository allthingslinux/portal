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

/**
 * OAuth provider type
 * Migrated from Supabase types
 */
export type Provider = string;

/**
 * User account/identity type for Better Auth
 */
export type UserAccount = {
  id: string;
  provider: string;
  providerAccountId: string;
  userId: string;
};

/**
 * JSON type for database JSONB fields
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
