import "server-only";

import { eq } from "drizzle-orm";
import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";
import { getLogger } from "~/shared/logger";

export function createDeleteTeamAccountService() {
  return new DeleteTeamAccountService();
}

class DeleteTeamAccountService {
  private readonly namespace = "accounts.delete-team-account";

  /**
   * Deletes a team account.
   */
  async deleteTeamAccount(params: { accountId: string; userId: string }) {
    const logger = await getLogger();
    const adminClient = db;

    const ctx = {
      accountId: params.accountId,
      userId: params.userId,
      name: this.namespace,
    };

    logger.info(ctx, "Requested team account deletion. Processing...");

    // Use admin client to delete the account (bypasses RLS)
    try {
      await adminClient
        .delete(accounts)
        .where(eq(accounts.id, params.accountId));

      logger.info(ctx, "Team account successfully deleted");
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to delete team account"
      );

      throw error;
    }
  }
}
