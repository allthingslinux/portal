import "server-only";

import type {
  Integration,
  IntegrationAccount,
  IntegrationCreateInput,
  IntegrationUpdateInput,
} from "./types";

export interface IntegrationBaseOptions {
  id: string;
  name: string;
  description: string;
  enabled?: boolean;
}

export abstract class IntegrationBase<
  TAccount extends IntegrationAccount = IntegrationAccount,
  TCreateInput extends IntegrationCreateInput = IntegrationCreateInput,
  TUpdateInput extends IntegrationUpdateInput = IntegrationUpdateInput,
> implements Integration<TAccount, TCreateInput, TUpdateInput>
{
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;

  constructor(options: IntegrationBaseOptions) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.enabled = options.enabled ?? true;
  }

  /**
   * Create a new integration account for a user.
   */
  abstract createAccount(
    userId: string,
    input: TCreateInput
  ): Promise<TAccount>;

  /**
   * Fetch a user's integration account, if one exists.
   */
  abstract getAccount(userId: string): Promise<TAccount | null>;

  /**
   * Update a user's integration account.
   */
  abstract updateAccount(
    accountId: string,
    input: TUpdateInput
  ): Promise<TAccount>;

  /**
   * Delete a user's integration account and clean up external services.
   */
  abstract deleteAccount(accountId: string): Promise<void>;
}
