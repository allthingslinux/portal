"use server";

import { and, eq } from "drizzle-orm";
import { db } from "~/core/database/client";
import { accounts } from "~/core/database/schema";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";
import { revalidateAccountLayout } from "~/shared/next/actions/revalidate-account-paths";

import { RemoveMemberSchema } from "../../schema/remove-member.schema";
import { TransferOwnershipConfirmationSchema } from "../../schema/transfer-ownership-confirmation.schema";
import { UpdateMemberRoleSchema } from "../../schema/update-member-role.schema";
import { createAccountMembersService } from "../services/account-members.service";

/**
 * Removes a member from an account.
 */
export const removeMemberFromAccountAction = enhanceAction(
  async ({ accountId, userId }) => {
    const service = createAccountMembersService();

    await service.removeMemberFromAccount({
      accountId,
      userId,
    });

    revalidateAccountLayout();

    return { success: true };
  },
  {
    schema: RemoveMemberSchema,
  }
);

/**
 * Updates the role of a member in an account.
 */
export const updateMemberRoleAction = enhanceAction(
  async (data) => {
    const service = createAccountMembersService();

    await service.updateMemberRole(data);

    revalidateAccountLayout();

    return { success: true };
  },
  {
    schema: UpdateMemberRoleSchema,
  }
);

/**
 * Transfers the ownership of an account to another member.
 */
export const transferOwnershipAction = enhanceAction(
  async (data, user) => {
    const logger = await getLogger();

    const ctx = {
      name: "teams.transferOwnership",
      userId: user.id,
      accountId: data.accountId,
    };

    logger.info(ctx, "Processing team ownership transfer request...");

    const ownerCheck = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(
        and(
          eq(accounts.id, data.accountId),
          eq(accounts.primaryOwnerUserId, user.id)
        )
      )
      .limit(1);

    if (ownerCheck.length === 0) {
      logger.error(ctx, "User is not the owner of this account");

      throw new Error(
        "You must be the owner of the account to transfer ownership"
      );
    }

    logger.info(ctx, "Proceeding with ownership transfer...");

    const service = createAccountMembersService();

    await service.transferOwnership(data);

    revalidateAccountLayout();

    logger.info(ctx, "Team ownership transferred successfully");

    return {
      success: true,
    };
  },
  {
    schema: TransferOwnershipConfirmationSchema,
  }
);
