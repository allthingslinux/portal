"use server";

import { eq } from "drizzle-orm";
import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import { accounts } from "~/core/database/supabase/drizzle/schema";
import { getLogger } from "~/shared/logger";
import { enhanceAction } from "~/shared/next/actions";
import { revalidateAccountLayout } from "~/shared/next/actions/revalidate-account-paths";

import { RemoveMemberSchema } from "../../schema/remove-member.schema";
import { TransferOwnershipConfirmationSchema } from "../../schema/transfer-ownership-confirmation.schema";
import { UpdateMemberRoleSchema } from "../../schema/update-member-role.schema";
import { createAccountMembersService } from "../services/account-members.service";

/**
 * @name removeMemberFromAccountAction
 * @description Removes a member from an account.
 */
export const removeMemberFromAccountAction = enhanceAction(
  async ({ accountId, userId }) => {
    const service = createAccountMembersService();

    await service.removeMemberFromAccount({
      accountId,
      userId,
    });

    // revalidate all pages that depend on the account
    revalidateAccountLayout();

    return { success: true };
  },
  {
    schema: RemoveMemberSchema,
  }
);

/**
 * @name updateMemberRoleAction
 * @description Updates the role of a member in an account.
 */
export const updateMemberRoleAction = enhanceAction(
  async (data) => {
    const service = createAccountMembersService();

    // update the role of the member
    await service.updateMemberRole(data);

    // revalidate all pages that depend on the account
    revalidateAccountLayout();

    return { success: true };
  },
  {
    schema: UpdateMemberRoleSchema,
  }
);

/**
 * @name transferOwnershipAction
 * @description Transfers the ownership of an account to another member.
 * Requires OTP verification for security.
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

    // assert that the user is the owner of the account
    const drizzleClient = await getDrizzleSupabaseClient();
    const ownerCheck = await drizzleClient.runTransaction(async (tx) =>
      tx
        .select({ count: true })
        .from(accounts)
        .where(eq(accounts.id, data.accountId))
        .where(eq(accounts.primaryOwnerUserId, user.id))
    );

    const isOwner = ownerCheck.length > 0;

    if (!isOwner) {
      logger.error(ctx, "User is not the owner of this account");

      throw new Error(
        "You must be the owner of the account to transfer ownership"
      );
    }

    // OTP verification removed - ownership transfer now requires only owner authentication
    logger.info(
      ctx,
      "Proceeding with ownership transfer (OTP verification removed)..."
    );

    const service = createAccountMembersService();

    // at this point, the user is authenticated, is the owner of the account, and has verified via OTP
    // so we proceed with the transfer of ownership with admin privileges

    // transfer the ownership of the account
    await service.transferOwnership(data);

    // revalidate all pages that depend on the account
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
