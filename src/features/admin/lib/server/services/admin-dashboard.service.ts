import { eq } from "drizzle-orm";
import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";
import { getLogger } from "~/shared/logger";

export function createAdminDashboardService() {
  return new AdminDashboardService();
}

export class AdminDashboardService {
  async getDashboardStats() {
    const logger = await getLogger();

    const [personalAccountsCount, teamAccountsCount] = await Promise.all([
      this.countAccounts({ isPersonal: true }).catch((error) => {
        logger.error(
          { error: error.message },
          "Failed to count personal accounts"
        );
        return 0;
      }),
      this.countAccounts({ isPersonal: false }).catch((error) => {
        logger.error({ error: error.message }, "Failed to count team accounts");
        return 0;
      }),
    ]);

    return {
      personalAccountsCount,
      teamAccountsCount,
      totalAccountsCount: personalAccountsCount + teamAccountsCount,
    };
  }

  private async countAccounts({ isPersonal }: { isPersonal: boolean }) {
    return db.$count(accounts, eq(accounts.isPersonalAccount, isPersonal));
  }
}
