import { eq } from 'drizzle-orm';

import { getLogger } from '~/shared/logger';
import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { accounts } from '~/core/database/supabase/drizzle/schema';

export function createAdminDashboardService() {
  return new AdminDashboardService();
}

export class AdminDashboardService {
  /**
   * Get the dashboard data for the admin dashboard
   * @param count
   */
  async getDashboardData(
    { count }: { count: 'exact' | 'estimated' | 'planned' } = {
      count: 'estimated',
    },
  ) {
    const logger = await getLogger();
    const adminClient = getDrizzleSupabaseAdminClient();

    const ctx = {
      name: `admin.dashboard`,
    };

    // Convert count parameter to Drizzle's count method
    const countMethod = count === 'exact' ? 'exact' : 'estimated';


    const accountsPromise = adminClient
      .$count(accounts, eq(accounts.isPersonalAccount, true))
      .then((count) => count)
      .catch((error) => {
        logger.error(
          { ...ctx, error: error.message },
          `Error fetching personal accounts`,
        );
        return 0;
      });

    const teamAccountsPromise = adminClient
      .$count(accounts, eq(accounts.isPersonalAccount, false))
      .then((count) => count)
      .catch((error) => {
        logger.error(
          { ...ctx, error: error.message },
          `Error fetching team accounts`,
        );
        return 0;
      });

    const [accountsCount, teamAccounts] =
      await Promise.all([
        accountsPromise,
        teamAccountsPromise,
      ]);

    return {
      accounts: accountsCount,
      teamAccounts,
    };
  }
}
