import type { AMREntry } from '@supabase/supabase-js';

/**
 * @name JWTUserData
 * @description The user data mapped from the JWT claims.
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
