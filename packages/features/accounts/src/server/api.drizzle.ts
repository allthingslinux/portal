import { eq } from 'drizzle-orm';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { accounts, userAccountWorkspace, userAccounts } from '@portal/supabase/drizzle-schema';

/**
 * Class representing an API for interacting with user accounts using Drizzle.
 */
class AccountsApiDrizzle {
  /**
   * @name getAccount
   * @description Get the account data for the given ID.
   * @param id
   */
  async getAccount(id: string) {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, id))
        .limit(1);
    });

    if (result.length === 0) {
      throw new Error('Account not found');
    }

    return result[0];
  }

  /**
   * @name getAccountWorkspace
   * @description Get the account workspace data.
   */
  async getAccountWorkspace() {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select()
        .from(userAccountWorkspace)
        .limit(1);
    });

    if (result.length === 0) {
      throw new Error('Workspace not found');
    }

    return result[0];
  }

  /**
   * @name loadUserAccounts
   * Load the user accounts.
   */
  async loadUserAccounts() {
    const drizzleClient = await getDrizzleSupabaseClient();

    const accounts = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select({
          name: userAccounts.name,
          slug: userAccounts.slug,
          pictureUrl: userAccounts.pictureUrl,
        })
        .from(userAccounts);
    });

    return accounts.map(({ name, slug, pictureUrl }) => ({
      label: name,
      value: slug,
      image: pictureUrl,
    }));
  }

  /**
   * @name getSubscription
   * Get the subscription data for the given user.
   * @param accountId
   */
          async getSubscription(_accountId: string) {
            // TODO: Implement with Drizzle when subscriptions schema is available
            throw new Error('Not implemented yet - requires subscriptions schema');
          }

          /**
           * Get the orders data for the given account.
           * @param accountId
           */
          async getOrder(_accountId: string) {
    // TODO: Implement with Drizzle when orders schema is available
    throw new Error('Not implemented yet - requires orders schema');
  }
}

export function createAccountsApiDrizzle() {
  return new AccountsApiDrizzle();
}
