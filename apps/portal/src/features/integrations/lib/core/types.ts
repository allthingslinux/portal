import type { z } from "zod";
import type { IntegrationStatus as IntegrationStatusType } from "@portal/utils/constants";
import { INTEGRATION_STATUSES } from "@portal/utils/constants";

export type IntegrationId = string;

/**
 * Integration account status type
 * Re-exported from constants for convenience
 */
export type IntegrationStatus = IntegrationStatusType;

/**
 * Integration status values array
 * Re-exported from constants for convenience
 */
export const integrationStatuses = INTEGRATION_STATUSES;

export interface IntegrationAccount<TMetadata = Record<string, unknown>> {
  createdAt: Date;
  id: string;
  integrationId: IntegrationId;
  metadata?: TMetadata;
  status: IntegrationStatus;
  updatedAt: Date;
  userId: string;
}

export interface IntegrationPublicInfo {
  description: string;
  enabled: boolean;
  id: IntegrationId;
  name: string;
}

export type IntegrationCreateInput = object;
export type IntegrationUpdateInput = object;

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
  /**
   * Zod schema for the account object (response validation).
   */
  accountSchema?: z.ZodType<TAccount>;

  /**
   * Create a new integration account for a user.
   */
  createAccount: (userId: string, input: TCreateInput) => Promise<TAccount>;

  /**
   * Zod schema for account creation input.
   */
  createAccountSchema?: z.ZodType<TCreateInput>;

  /**
   * Custom operations exposed by the integration.
   */
  customOperations?: Record<string, IntegrationCustomOperation>;

  /**
   * Delete a user's integration account and clean up external services.
   */
  deleteAccount: (accountId: string) => Promise<void>;
  description: string;
  enabled: boolean;

  /**
   * Generate a default identifier from a user email if needed.
   */
  generateIdentifier?: (email: string) => string;

  /**
   * Fetch a user's integration account, if one exists.
   */
  getAccount: (userId: string) => Promise<TAccount | null>;

  /**
   * Fetch an integration account by its ID.
   */
  getAccountById?: (accountId: string) => Promise<TAccount | null>;
  id: IntegrationId;
  name: string;

  /**
   * Update a user's integration account.
   */
  updateAccount: (accountId: string, input: TUpdateInput) => Promise<TAccount>;

  /**
   * Zod schema for account update input.
   */
  updateAccountSchema?: z.ZodType<TUpdateInput>;

  /**
   * Validate a user-provided identifier (username/handle) if needed.
   */
  validateIdentifier?: (identifier: string) => boolean;
}
