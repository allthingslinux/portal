import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

import { db } from "~/lib/database/client";
import { accounts, userAccountWorkspace } from "~/lib/database/schema";
import { API_ERRORS } from "~/shared/constants/errors";

type Account = InferSelectModel<typeof accounts>;
type UserAccountWorkspace = typeof userAccountWorkspace.$inferSelect;

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
    const result = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

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
    const result = await db.select().from(userAccountWorkspace).limit(1);

    if (result.length === 0) {
      throw new Error(API_ERRORS.WORKSPACE_NOT_FOUND);
    }

    return result[0];
  }

  /**
   * @name loadUserAccounts
   * Load the user accounts.
   */
  async loadUserAccounts(
    _userId: string
  ): Promise<Array<{ label: string; value: string; image: string | null }>> {
    // No team accounts - return empty array
    return [];
  }
}

export function createAccountsApi() {
  return new _AccountsApi();
}
