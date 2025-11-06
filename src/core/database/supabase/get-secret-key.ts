import 'server-only';

import { z } from 'zod';

const message =
  'Invalid Supabase Secret Key. Please add the environment variable SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.';

/**
 * @name getSupabaseSecretKey
 * @description Get the Supabase Service Role Key.
 * ONLY USE IN SERVER-SIDE CODE. DO NOT EXPOSE THIS TO CLIENT-SIDE CODE.
 */
export function getSupabaseSecretKey() {
  return z
    .string({
      required_error: message,
    })
    .min(1, {
      message: message,
    })
    .parse(
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
}

/**
 * Displays a warning message if the Supabase Service Role is being used.
 */
export function warnServiceRoleKeyUsage() {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Dev Only] This is a simple warning to let you know you are using the Supabase Secret Key. This key bypasses RLS and should only be used in server-side code. Please make sure it's the intended usage.`,
    );
  }
}
