import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { Database } from '../database.types';
import {
  getSupabaseSecretKey,
  warnServiceRoleKeyUsage,
} from '../get-secret-key';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

/**
 * @name getSupabaseServerAdminClient
 * @description Get a Supabase client for use in the Server with admin access to the database.
 */
export function getSupabaseServerAdminClient<GenericSchema = Database>() {
  warnServiceRoleKeyUsage();

  const url = getSupabaseClientKeys().url;
  const secretKey = getSupabaseSecretKey();

  return createClient<GenericSchema>(url, secretKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
    },
  });
}
