import { eq } from "drizzle-orm";
import { getDrizzleSupabaseAdminClient } from "~/core/database/supabase/clients/drizzle-client";
import { accounts } from "~/core/database/supabase/drizzle/schema";
import { getLogger } from "~/shared/logger";

export function createAdminDashboardService() {
  return new AdminDashboardService();
}

export class AdminDashboardService {
  /**
   * Get the dashboard data for the admin dashboard
   * @param count
   */
  async getDashboardData(
    { count: _count }: { count: "exact" | "estimated" | "planned" } = {
      count: "estimated",
    }
  ) {
    const logger = await getLogger();
    const adminClient = getDrizzleSupabaseAdminClient();

    const ctx = {
      name: "admin.dashboard",
    };

    const accountsPromise = adminClient
      .$count(accounts, eq(accounts.isPersonalAccount, true))
      .then((accountCount) => accountCount)
      .catch((countError) => {
        logger.error(
          { ...ctx, error: countError.message },
          "Error fetching personal accounts"
        );
        return 0;
      });

    const teamAccountsPromise = adminClient
      .$count(accounts, eq(accounts.isPersonalAccount, false))
      .then((accountCount) => accountCount)
      .catch((countError) => {
        logger.error(
          { ...ctx, error: countError.message },
          "Error fetching team accounts"
        );
        return 0;
      });

    const [accountsCount, teamAccounts] = await Promise.all([
      accountsPromise,
      teamAccountsPromise,
    ]);

    return {
      accounts: accountsCount,
      teamAccounts,
    };
  }
}
