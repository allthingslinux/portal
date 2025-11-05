'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@portal/next/actions';
import { createOtpApi } from '@portal/otp';
import { getLogger } from '@portal/shared/logger';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { accounts } from '@portal/supabase/drizzle-schema';
import { eq, and } from 'drizzle-orm';

import { DeleteTeamAccountSchema } from '../../schema/delete-team-account.schema';
import { createDeleteTeamAccountService } from '../services/delete-team-account.service.drizzle';

const enableTeamAccountDeletion =
  process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION === 'true';

export const deleteTeamAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    const params = DeleteTeamAccountSchema.parse(
      Object.fromEntries(formData.entries()),
    );

    const otpService = createOtpApi(getSupabaseServerClient());

    const otpResult = await otpService.verifyToken({
      purpose: `delete-team-account-${params.accountId}`,
      userId: user.id,
      token: params.otp,
    });

    if (!otpResult.valid) {
      throw new Error('Invalid OTP code');
    }

    const ctx = {
      name: 'team-accounts.delete',
      userId: user.id,
      accountId: params.accountId,
    };

    if (!enableTeamAccountDeletion) {
      logger.warn(ctx, `Team account deletion is not enabled`);

      throw new Error('Team account deletion is not enabled');
    }

    logger.info(ctx, `Deleting team account...`);

    await deleteTeamAccount({
      accountId: params.accountId,
      userId: user.id,
    });

    logger.info(ctx, `Team account request successfully sent`);

    return redirect('/home');
  },
  {
    auth: true,
  },
);

async function deleteTeamAccount(params: {
  accountId: string;
  userId: string;
}) {
  const service = createDeleteTeamAccountService();

  // verify that the user has the necessary permissions to delete the team account
  await assertUserPermissionsToDeleteTeamAccount(params.accountId, userId);

  // delete the team account
  await service.deleteTeamAccount(params);
}

async function assertUserPermissionsToDeleteTeamAccount(
  accountId: string,
  userId: string,
) {
  const drizzleClient = await getDrizzleSupabaseClient();

  const result = await drizzleClient.runTransaction(async (tx) => {
    return await tx
      .select({ count: accounts.id })
      .from(accounts)
      .where(
        and(
          eq(accounts.id, accountId),
          eq(accounts.primaryOwnerUserId, userId)
        )
      )
      .limit(1);
  });

  const isOwner = result.length > 0;

  if (!isOwner) {
    throw new Error('You do not have permission to delete this account');
  }

  return isOwner;
}
