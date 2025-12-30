import { db } from "~/lib/database/client";
import { accounts } from "~/lib/database/schema";
import { getLogger } from "~/shared/logger";

export function createAdminDashboardService() {
  return new AdminDashboardService();
}

export class AdminDashboardService {
  async getDashboardStats() {
    const logger = await getLogger();

    const personalAccountsCount = await this.countAccounts().catch((error) => {
      logger.error(
        { error: error.message },
        "Failed to count personal accounts"
      );
      return 0;
    });

    return {
      personalAccountsCount,
      totalAccountsCount: personalAccountsCount, // Only personal accounts now
    };
  }

  private async countAccounts() {
    return db.$count(accounts); // Count all accounts (personal only now)
  }
}
