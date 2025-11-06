import 'server-only';

import { eq } from 'drizzle-orm';

import { getLogger } from '~/shared/logger';
import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { accounts } from '~/core/database/supabase/drizzle/schema';

export function createAdminAccountsService() {
  return new AdminAccountsService();
}

class AdminAccountsService {
  async deleteAccount(accountId: string) {
    const logger = await getLogger();
    const adminClient = getDrizzleSupabaseAdminClient();

    const ctx = {
      name: 'admin.accounts.delete',
      accountId,
    };

    logger.info(ctx, 'Admin deleting account');

    try {
      const result = await adminClient
        .delete(accounts)
        .where(eq(accounts.id, accountId));

      logger.info(ctx, 'Account successfully deleted by admin');

      return result;
    } catch (error) {
      logger.error({ ...ctx, error }, 'Failed to delete account');
      throw error;
    }
  }
}
