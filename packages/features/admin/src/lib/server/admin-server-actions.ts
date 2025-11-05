'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@portal/next/actions';
import { getLogger } from '@portal/shared/logger';
import { getSupabaseServerAdminClient } from '@portal/supabase/server-admin-client';
import { getSupabaseServerClient } from '@portal/supabase/server-client';

import {
  BanUserSchema,
  DeleteAccountSchema,
  DeleteUserSchema,
  ImpersonateUserSchema,
  ReactivateUserSchema,
} from './schema/admin-actions.schema';
import { CreateUserSchema } from './schema/create-user.schema';
import { ResetPasswordSchema } from './schema/reset-password.schema';
import { createAdminAccountsService } from './services/admin-accounts.service.drizzle';
import { createAdminAuthUserService } from './services/admin-auth-user.service';
import { adminAction } from './utils/admin-action';

/**
 * @name banUserAction
 * @description Ban a user from the system.
 */
export const banUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, `Super Admin is banning user...`);

      const { error } = await service.banUser(userId);

      if (error) {
        logger.error({ error }, `Error banning user`);

        return {
          success: false,
        };
      }

      revalidateAdmin();

      logger.info({ userId }, `Super Admin has successfully banned user`);
    },
    {
      schema: BanUserSchema,
    },
  ),
);

/**
 * @name reactivateUserAction
 * @description Reactivate a user in the system.
 */
export const reactivateUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, `Super Admin is reactivating user...`);

      const { error } = await service.reactivateUser(userId);

      if (error) {
        logger.error({ error }, `Error reactivating user`);

        return {
          success: false,
        };
      }

      revalidateAdmin();

      logger.info({ userId }, `Super Admin has successfully reactivated user`);
    },
    {
      schema: ReactivateUserSchema,
    },
  ),
);

/**
 * @name impersonateUserAction
 * @description Impersonate a user in the system.
 */
export const impersonateUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, `Super Admin is impersonating user...`);

      return await service.impersonateUser(userId);
    },
    {
      schema: ImpersonateUserSchema,
    },
  ),
);

/**
 * @name deleteUserAction
 * @description Delete a user from the system.
 */
export const deleteUserAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, `Super Admin is deleting user...`);

      await service.deleteUser(userId);

      logger.info({ userId }, `Super Admin has successfully deleted user`);

      return redirect('/admin/accounts');
    },
    {
      schema: DeleteUserSchema,
    },
  ),
);

/**
 * @name deleteAccountAction
 * @description Delete an account from the system.
 */
export const deleteAccountAction = adminAction(
  enhanceAction(
    async ({ accountId }) => {
      const service = getAdminAccountsService();
      const logger = await getLogger();

      logger.info({ accountId }, `Super Admin is deleting account...`);

      await service.deleteAccount(accountId);

      revalidateAdmin();

      logger.info(
        { accountId },
        `Super Admin has successfully deleted account`,
      );

      return redirect('/admin/accounts');
    },
    {
      schema: DeleteAccountSchema,
    },
  ),
);

/**
 * @name createUserAction
 * @description Create a new user in the system.
 */
export const createUserAction = adminAction(
  enhanceAction(
    async ({ email, password, emailConfirm }) => {
      const adminClient = getSupabaseServerAdminClient();
      const logger = await getLogger();

      logger.info({ email }, `Super Admin is creating a new user...`);

      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: emailConfirm,
      });

      if (error) {
        logger.error({ error }, `Error creating user`);
        throw new Error(`Error creating user: ${error.message}`);
      }

      logger.info(
        { userId: data.user.id },
        `Super Admin has successfully created a new user`,
      );

      revalidatePath(`/admin/accounts`);

      return {
        success: true,
        user: data.user,
      };
    },
    {
      schema: CreateUserSchema,
    },
  ),
);

/**
 * @name resetPasswordAction
 * @description Reset a user's password by sending a password reset email.
 */
export const resetPasswordAction = adminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();
      const logger = await getLogger();

      logger.info({ userId }, `Super Admin is resetting user password...`);

      const result = await service.resetPassword(userId);

      logger.info(
        { userId },
        `Super Admin has successfully sent password reset email`,
      );

      return result;
    },
    {
      schema: ResetPasswordSchema,
    },
  ),
);

function revalidateAdmin() {
  revalidatePath(`/admin/accounts/[id]`, 'page');
}

function getAdminAuthService() {
  const client = getSupabaseServerClient();
  const adminClient = getSupabaseServerAdminClient();

  return createAdminAuthUserService(client, adminClient);
}

function getAdminAccountsService() {
  const adminClient = getSupabaseServerAdminClient();

  return createAdminAccountsService();
}
