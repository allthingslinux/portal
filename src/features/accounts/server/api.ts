import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

import { getDrizzleSupabaseClient } from "~/core/database/supabase/clients/drizzle-client";
import {
  accounts,
  userAccounts,
  userAccountWorkspace,
} from "~/core/database/supabase/drizzle/schema";
import { API_ERRORS } from "~/shared/constants/errors";

type Account = InferSelectModel<typeof accounts>;
type UserAccountWorkspace = InferSelectModel<typeof userAccountWorkspace>;

/**
 * Class representing an API for interacting with user accounts using Drizzle.
 */
class _AccountsApi {
  /**
   * @name getAccount
   * @description Get the account data for the given ID.
   * @param id
   */
  async getAccount(id: string): Promise<Account> {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(
      async (tx) =>
        await tx.select().from(accounts).where(eq(accounts.id, id)).limit(1)
    );

    if (result.length === 0) {
      throw new Error(API_ERRORS.ACCOUNT_NOT_FOUND);
    }

    return result[0];
  }

  /**
   * @name getAccountWorkspace
   * @description Get the account workspace data.
   */
  async getAccountWorkspace(): Promise<UserAccountWorkspace> {
    const drizzleClient = await getDrizzleSupabaseClient();

    const result = await drizzleClient.runTransaction(
      async (tx) => await tx.select().from(userAccountWorkspace).limit(1)
    );

    if (result.length === 0) {
      throw new Error(API_ERRORS.WORKSPACE_NOT_FOUND);
    }

    return result[0];
  }

  /**
   * @name loadUserAccounts
   * Load the user accounts.
   */
  async loadUserAccounts(): Promise<
    Array<{ label: string; value: string; image: string | null }>
  > {
    const drizzleClient = await getDrizzleSupabaseClient();

    const accountResults = await drizzleClient.runTransaction(
      async (tx) =>
        await tx
          .select({
            name: userAccounts.name,
            slug: userAccounts.slug,
            pictureUrl: userAccounts.pictureUrl,
          })
          .from(userAccounts)
    );

    return accountResults.map(({ name, slug, pictureUrl }) => ({
      label: name ?? "",
      value: slug ?? "",
      image: pictureUrl,
    }));
  }
}

export function createAccountsApi() {
  return new _AccountsApi();
}
