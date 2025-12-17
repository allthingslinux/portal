import "server-only";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/core/database/client";
import { accountsMemberships } from "~/core/database/schema";
import { getLogger } from "~/shared/logger";

const Schema = z.object({
  accountId: z.string().uuid(),
  userId: z.string().uuid(),
});

export function createLeaveTeamAccountService() {
  return new LeaveTeamAccountService();
}

/**
 * @name LeaveTeamAccountService
 * @description Service for leaving a team account.
 */
class LeaveTeamAccountService {
  private readonly namespace = "leave-team-account";

  /**
   * @name leaveTeamAccount
   * @description Leave a team account
   * @param params
   */
  async leaveTeamAccount(params: z.infer<typeof Schema>) {
    const logger = await getLogger();
    const adminClient = db;

    const ctx = {
      ...params,
      name: this.namespace,
    };

    logger.info(ctx, "Leaving team account...");

    const { accountId, userId } = Schema.parse(params);

    try {
      await adminClient
        .delete(accountsMemberships)
        .where(
          and(
            eq(accountsMemberships.accountId, accountId),
            eq(accountsMemberships.userId, userId)
          )
        );

      logger.info(ctx, "Successfully left team account");
    } catch (error) {
      logger.error({ ...ctx, error }, "Failed to leave team account");
      throw new Error("Failed to leave team account");
    }
  }
}
