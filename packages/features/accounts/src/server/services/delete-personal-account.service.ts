import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

import { getLogger } from '@portal/shared/logger';
import { Database } from '@portal/supabase/database';

export function createDeletePersonalAccountService() {
  return new DeletePersonalAccountService();
}

/**
 * @name DeletePersonalAccountService
 * @description Service for managing accounts in the application
 * @param Database - The Supabase database type to use
 * @example
 * const client = getSupabaseClient();
 * const accountsService = new DeletePersonalAccountService();
 */
class DeletePersonalAccountService {
  private namespace = 'accounts.delete';

  /**
   * @name deletePersonalAccount
   * Delete personal account of a user.
   * This will delete the user from the authentication provider and cancel all subscriptions.
   *
   * Permissions are not checked here, as they are checked in the server action.
   * USE WITH CAUTION. THE USER MUST HAVE THE NECESSARY PERMISSIONS.
   */
  async deletePersonalAccount(params: {
    adminClient: SupabaseClient<Database>;
    account: {
      id: string;
      email: string | null;
    };
  }) {
    const logger = await getLogger();

    const userId = params.account.id;
    const ctx = { userId, name: this.namespace };

    logger.info(
      ctx,
      'User requested to delete their personal account. Processing...',
    );

    // execute the deletion of the user
    try {
      const response = await params.adminClient.auth.admin.deleteUser(userId);

      if (response.error) {
        throw response.error;
      }

      logger.info(ctx, 'User successfully deleted!');

      if (params.account.email) {
        // dispatch the delete account email. Errors are handled in the method.
        await this.dispatchDeleteAccountEmail({
          email: params.account.email,
          id: params.account.id,
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Encountered an error deleting user',
      );

      throw new Error('Error deleting user');
    }
  }

  private async dispatchDeleteAccountEmail(account: {
    email: string;
    id: string;
  }) {
    const logger = await getLogger();
    const ctx = { name: this.namespace, userId: account.id };

    try {
      logger.info(ctx, 'Sending delete account email...');

      await this.sendDeleteAccountEmail(account);

      logger.info(ctx, 'Delete account email sent successfully');
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        'Failed to send delete account email',
      );
    }
  }

  private async sendDeleteAccountEmail(account: { email: string }) {
    const emailSettings = this.getEmailSettings();

    const { renderAccountDeleteEmail } = await import('@portal/email-templates');
    const { getMailer } = await import('@portal/mailers');

    const mailer = await getMailer();

    const { html, subject } = await renderAccountDeleteEmail({
      productName: emailSettings.productName,
    });

    await mailer.sendEmail({
      from: emailSettings.fromEmail,
      html,
      subject,
      to: account.email,
    });
  }

  private getEmailSettings() {
    const productName = process.env.NEXT_PUBLIC_PRODUCT_NAME;
    const fromEmail = process.env.EMAIL_SENDER;

    return z
      .object({
        productName: z
          .string({
            required_error: 'NEXT_PUBLIC_PRODUCT_NAME is required',
          })
          .min(1),
        fromEmail: z
          .string({
            required_error: 'EMAIL_SENDER is required',
          })
          .min(1),
      })
      .parse({
        productName,
        fromEmail,
      });
  }
}
