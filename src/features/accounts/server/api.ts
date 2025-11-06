import { eq } from 'drizzle-orm';

import { getDrizzleSupabaseClient } from '~/core/database/supabase/clients/drizzle-client';
import {
  accounts,
  userAccountWorkspace,
  userAccounts,
} from '~/core/database/supabase/drizzle/schema';

/**
 * Class representing an API for interacting with user accounts using Drizzle.
 */
class _AccountsApi {
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
  }) as any[];

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
    return await tx.select().from(userAccountWorkspace).limit(1);
  }) as any[];

  if (result.length === 0) {
      throw new Error('Workspace not found');
    }

    return result[0];
  }

  /**
   * @name loadUserAccounts
   * Load the user accounts.
   */
  async loadUserAccounts(): Promise<Array<{ label: string; value: string; image: string | null }>> {
    const drizzleClient = await getDrizzleSupabaseClient();

    const accounts = await drizzleClient.runTransaction(async (tx) => {
      return await tx
        .select({
          name: userAccounts.name,
          slug: userAccounts.slug,
          pictureUrl: userAccounts.pictureUrl,
        })
        .from(userAccounts);
    }) as any[];

    return accounts.map(({ name, slug, pictureUrl }) => ({
      label: name,
      value: slug,
      image: pictureUrl,
    }));
  }

}

export function createAccountsApi() {
  return new _AccountsApi();
}
