export type IntegrationId = string;

export type IntegrationStatus = "active" | "suspended" | "deleted";

export const integrationStatuses = ["active", "suspended", "deleted"] as const;

export interface IntegrationAccount<TMetadata = Record<string, unknown>> {
  id: string;
  userId: string;
  integrationId: IntegrationId;
  status: IntegrationStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: TMetadata;
}

export interface IntegrationPublicInfo {
  id: IntegrationId;
  name: string;
  description: string;
  enabled: boolean;
}

export type IntegrationCreateInput = Record<string, unknown>;
export type IntegrationUpdateInput = Record<string, unknown>;

export interface IntegrationOperationContext {
  userId?: string;
}

export type IntegrationCustomOperation = (
  input: unknown,
  context: IntegrationOperationContext
) => Promise<unknown>;

export interface Integration<
  TAccount extends IntegrationAccount = IntegrationAccount,
  TCreateInput extends IntegrationCreateInput = IntegrationCreateInput,
  TUpdateInput extends IntegrationUpdateInput = IntegrationUpdateInput,
> {
  id: IntegrationId;
  name: string;
  description: string;
  enabled: boolean;

  /**
   * Create a new integration account for a user.
   */
  createAccount: (userId: string, input: TCreateInput) => Promise<TAccount>;

  /**
   * Fetch a user's integration account, if one exists.
   */
  getAccount: (userId: string) => Promise<TAccount | null>;

  /**
   * Fetch an integration account by its ID.
   */
  getAccountById?: (accountId: string) => Promise<TAccount | null>;

  /**
   * Update a user's integration account.
   */
  updateAccount: (accountId: string, input: TUpdateInput) => Promise<TAccount>;

  /**
   * Delete a user's integration account and clean up external services.
   */
  deleteAccount: (accountId: string) => Promise<void>;

  /**
   * Validate a user-provided identifier (username/handle) if needed.
   */
  validateIdentifier?: (identifier: string) => boolean;

  /**
   * Generate a default identifier from a user email if needed.
   */
  generateIdentifier?: (email: string) => string;

  /**
   * Custom operations exposed by the integration.
   */
  customOperations?: Record<string, IntegrationCustomOperation>;
}
