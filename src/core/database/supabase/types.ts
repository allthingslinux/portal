/**
 * @name AMREntry
 * @description Authentication Method Reference entry
 * @deprecated This is kept for backward compatibility with database types only
 */
export type AMREntry = {
  method: string;
  timestamp: number;
};

/**
 * @deprecated Use BetterAuthUser from ~/core/auth/better-auth/types instead
 * This type is kept only for database type compatibility
 */
export type JWTUserData = {
  is_anonymous: boolean;
  aal: `aal1` | `aal2`;
  email: string;
  phone: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  id: string;
  amr: AMREntry[];
};
