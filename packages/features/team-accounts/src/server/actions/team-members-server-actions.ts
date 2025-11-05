'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@portal/next/actions';
import { createOtpApi } from '@portal/otp';
import { getLogger } from '@portal/shared/logger';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { accounts } from '@portal/supabase/drizzle-schema';
import { eq } from 'drizzle-orm';

import { RemoveMemberSchema } from '../../schema/remove-member.schema';
import { TransferOwnershipConfirmationSchema } from '../../schema/transfer-ownership-confirmation.schema';
import { UpdateMemberRoleSchema } from '../../schema/update-member-role.schema';
import { createAccountMembersService } from '../services/account-members.service.drizzle';

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
    revalidatePath('/home/[account]', 'layout');

    return { success: true };
  },
  {
    schema: RemoveMemberSchema,
  },
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
    revalidatePath('/home/[account]', 'layout');

    return { success: true };
  },
  {
    schema: UpdateMemberRoleSchema,
  },
);

/**
 * @name transferOwnershipAction
 * @description Transfers the ownership of an account to another member.
 * Requires OTP verification for security.
 */
export const transferOwnershipAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const logger = await getLogger();

    const ctx = {
      name: 'teams.transferOwnership',
      userId: user.id,
      accountId: data.accountId,
    };

    logger.info(ctx, 'Processing team ownership transfer request...');

    // assert that the user is the owner of the account
    const drizzleClient = await getDrizzleSupabaseClient();
    const ownerCheck = await drizzleClient.runTransaction(async (tx) => {
      return tx
        .select({ count: true })
        .from(accounts)
        .where(eq(accounts.id, data.accountId))
        .where(eq(accounts.primaryOwnerUserId, user.id));
    });

    const isOwner = ownerCheck.length > 0;

    if (!isOwner) {
      logger.error(ctx, 'User is not the owner of this account');

      throw new Error(
        `You must be the owner of the account to transfer ownership`,
      );
    }

    // Verify the OTP
    const otpApi = createOtpApi(client);

    const otpResult = await otpApi.verifyToken({
      token: data.otp,
      userId: user.id,
      purpose: `transfer-team-ownership-${data.accountId}`,
    });

    if (!otpResult.valid) {
      logger.error(ctx, 'Invalid OTP provided');
      throw new Error('Invalid OTP');
    }

    // validate the user ID matches the nonce's user ID
    if (otpResult.user_id !== user.id) {
      logger.error(
        ctx,
        `This token was meant to be used by a different user. Exiting.`,
      );

      throw new Error('Nonce mismatch');
    }

    logger.info(
      ctx,
      'OTP verification successful. Proceeding with ownership transfer...',
    );

    const service = createAccountMembersService();

    // at this point, the user is authenticated, is the owner of the account, and has verified via OTP
    // so we proceed with the transfer of ownership with admin privileges

    // transfer the ownership of the account
    await service.transferOwnership(data);

    // revalidate all pages that depend on the account
    revalidatePath('/home/[account]', 'layout');

    logger.info(ctx, 'Team ownership transferred successfully');

    return {
      success: true,
    };
  },
  {
    schema: TransferOwnershipConfirmationSchema,
  },
);
