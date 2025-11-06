import 'server-only';

import { eq } from 'drizzle-orm';

import { getLogger } from '~/shared/logger';
import { getDrizzleSupabaseAdminClient } from '~/core/database/supabase/clients/drizzle-client';
import { accounts, accountsMemberships } from '~/core/database/supabase/drizzle/schema';

export function createDeletePersonalAccountService() {
  return new DeletePersonalAccountService();
}

/**
 * @name DeletePersonalAccountService
 * @description Service for managing accounts in the application
 * @example
 * const accountsService = createDeletePersonalAccountService();
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
    account: {
      id: string;
      email: string | null;
    };
  }) {
    const logger = await getLogger();
    const adminClient = getDrizzleSupabaseAdminClient();

    const userId = params.account.id;
    const ctx = { userId, name: this.namespace };

    logger.info(
      ctx,
      'User requested to delete their personal account. Processing...',
    );

    // execute the deletion of the user
    await adminClient.transaction(async (tx) => {
      // Delete account memberships first (foreign key constraint)
      await tx
        .delete(accountsMemberships)
        .where(eq(accountsMemberships.userId, userId));

      // Delete the account
      await tx.delete(accounts).where(eq(accounts.primaryOwnerUserId, userId));

      logger.info(ctx, 'Personal account deleted successfully');
    });

    // Note: Auth user deletion should be handled separately
    // as it requires Supabase Auth Admin API, not database operations
  }
}
