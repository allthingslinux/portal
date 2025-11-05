import { eq } from 'drizzle-orm';

import { getLogger } from '@portal/shared/logger';
import { getDrizzleSupabaseAdminClient } from '@portal/supabase/drizzle-client';
import { accounts } from '@portal/supabase/drizzle-schema';

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

    // Note: Subscriptions queries are commented out since billing features were removed
    // If billing is re-enabled, these would need to be restored with proper schema

    const subscriptionsPromise = Promise.resolve(0); // Placeholder since billing removed
    const trialsPromise = Promise.resolve(0); // Placeholder since billing removed

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

    const [subscriptions, trials, accountsCount, teamAccounts] =
      await Promise.all([
        subscriptionsPromise,
        trialsPromise,
        accountsPromise,
        teamAccountsPromise,
      ]);

    return {
      subscriptions,
      trials,
      accounts: accountsCount,
      teamAccounts,
    };
  }
}
