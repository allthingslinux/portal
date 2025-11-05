import { getSupabaseServerClient } from '@portal/supabase/server-client';
import { getLogger } from '@portal/shared/logger';

/**
 * @name isSuperAdmin
 * @description Check if the current user is a super admin.
 * Migrated from RPC to direct JWT token checking for better performance.
 * @param client - Not needed in Drizzle version, kept for compatibility
 */
export async function isSuperAdmin(client?: any): Promise<boolean> {
  try {
    // Get the current session to access JWT token
    const supabaseClient = getSupabaseServerClient();
    const { data: session } = await supabaseClient.auth.getSession();

    if (!session?.session?.access_token) {
      return false;
    }

    // Decode JWT token to check app_metadata.role
    const payload = JSON.parse(atob(session.session.access_token.split('.')[1]));
    const appMetadata = payload.app_metadata || {};
    const role = appMetadata.role;

    return role === 'super-admin';
  } catch (error) {
    const logger = await getLogger();
    logger.error({ error }, 'Error checking super admin status');
    return false;
  }
}
