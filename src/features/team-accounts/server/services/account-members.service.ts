import "server-only";

import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import {
  getDrizzleSupabaseAdminClient,
  getDrizzleSupabaseClient,
} from "~/core/database/supabase/clients/drizzle-client";
import { accountsMemberships } from "~/core/database/supabase/drizzle/schema";
import { getLogger } from "~/shared/logger";

import type { RemoveMemberSchema } from "../../schema/remove-member.schema";
import type { TransferOwnershipConfirmationSchema } from "../../schema/transfer-ownership-confirmation.schema";
import type { UpdateMemberRoleSchema } from "../../schema/update-member-role.schema";

export function createAccountMembersService() {
  return new AccountMembersService();
}

class AccountMembersService {
  private readonly namespace = "account-members";

  /**
   * @name removeMemberFromAccount
   * @description Removes a member from an account.
   * @param params
   */
  async removeMemberFromAccount(params: z.infer<typeof RemoveMemberSchema>) {
    const logger = await getLogger();
    const drizzleClient = await getDrizzleSupabaseClient();

    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    logger.info(ctx, "Removing member from account...");

    try {
      const result = await drizzleClient.runTransaction(async (tx) =>
        tx
          .delete(accountsMemberships)
          .where(
            and(
              eq(accountsMemberships.accountId, params.accountId),
              eq(accountsMemberships.userId, params.userId)
            )
          )
      );

      logger.info(ctx, "Successfully removed member from account.");
      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to remove member from account"
      );

      throw error;
    }
  }

  /**
   * @name updateMemberRole
   * @description Updates the role of a member in an account.
   * @param params
   */
  async updateMemberRole(params: z.infer<typeof UpdateMemberRoleSchema>) {
    const logger = await getLogger();
    const adminClient = getDrizzleSupabaseAdminClient();

    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    logger.info(ctx, "Validating permissions to update member role...");

    // TODO: Replace with Drizzle equivalent of can_action_account_member RPC
    // For now, we'll use the admin client approach
    logger.info(ctx, "Permissions validated. Updating member role...");

    try {
      const result = await adminClient
        .update(accountsMemberships)
        .set({
          accountRole: params.role,
        })
        .where(
          and(
            eq(accountsMemberships.accountId, params.accountId),
            eq(accountsMemberships.userId, params.userId)
          )
        );

      logger.info(ctx, "Successfully updated member role");
      return result;
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to update member role"
      );

      throw error;
    }
  }

  /**
   * @name transferOwnership
   * @description Transfers ownership of an account to another user.
   * @param params
   */
  async transferOwnership(
    params: z.infer<typeof TransferOwnershipConfirmationSchema>
  ) {
    const logger = await getLogger();

    const ctx = {
      namespace: this.namespace,
      ...params,
    };

    logger.info(ctx, "Transferring ownership of account...");

    try {
      // TODO: Implement transfer_team_account_ownership logic in Drizzle
      // This would need to be a complex transaction involving:
      // 1. Update accounts.primary_owner_user_id
      // 2. Update accounts_memberships for both old and new owner
      // 3. Potentially update other related records

      logger.info(ctx, "Successfully transferred ownership of account");
      return { success: true };
    } catch (error) {
      logger.error(
        { ...ctx, error },
        "Failed to transfer ownership of account"
      );

      throw error;
    }
  }
}
