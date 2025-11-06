'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '~/shared/next/actions';
import { createOtpApi } from '~/core/auth/otp/api';
import { getLogger } from '~/shared/logger';
import { getSupabaseServerClient } from '~/core/database/supabase/clients/server-client';

import { DeletePersonalAccountSchema } from '../schema/delete-personal-account.schema';
import { createDeletePersonalAccountService } from './services/delete-personal-account.service';

const enableAccountDeletion =
  process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION === 'true';

export async function refreshAuthSession() {
  const client = getSupabaseServerClient();

  await client.auth.refreshSession();

  return {};
}

export const deletePersonalAccountAction = enhanceAction(
  async (formData: FormData, user) => {
    const logger = await getLogger();

    // validate the form data
    const { success } = DeletePersonalAccountSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!success) {
      throw new Error('Invalid form data');
    }

    const ctx = {
      name: 'account.delete',
      userId: user.id,
    };

    const otp = formData.get('otp') as string;

    if (!otp) {
      throw new Error('OTP is required');
    }

    if (!enableAccountDeletion) {
      logger.warn(ctx, `Account deletion is not enabled`);

      throw new Error('Account deletion is not enabled');
    }

    logger.info(ctx, `Deleting account...`);

    // verify the OTP
    const client = getSupabaseServerClient();
    const otpApi = createOtpApi(client);

    const otpResult = await otpApi.verifyToken({
      token: otp,
      userId: user.id,
      purpose: 'delete-personal-account',
    });

    if (!otpResult.valid) {
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

    // create a new instance of the personal accounts service
    const service = createDeletePersonalAccountService();

    // delete the user's account and cancel all subscriptions
    await service.deletePersonalAccount({
      account: {
        id: user.id,
        email: user.email ?? null,
      },
    });

    // sign out the user after deleting their account
    await client.auth.signOut();

    logger.info(ctx, `Account request successfully sent`);

    // clear the cache for all pages
    revalidatePath('/', 'layout');

    // redirect to the home page
    redirect('/');
  },
  {},
);
