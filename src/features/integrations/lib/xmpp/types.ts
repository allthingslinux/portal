// ============================================================================
// XMPP Types
// ============================================================================
// TypeScript types for XMPP account management and Prosody REST API
// Types are inferred from Zod schemas for single source of truth

import type { z } from "zod";

import type {
  CreateXmppAccountRequestSchema,
  UpdateXmppAccountRequestSchema,
  UpdateXmppAccountStatusSchema,
  XmppAccountSchema,
  XmppAccountStatusSchema,
} from "@/shared/schemas/integrations/xmpp";

/**
 * XMPP account status
 * Inferred from Zod schema
 */
export type XmppAccountStatus = z.infer<typeof XmppAccountStatusSchema>;

/**
 * XMPP account information
 * Inferred from Zod schema for type safety
 */
export type XmppAccount = z.infer<typeof XmppAccountSchema>;

/**
 * Create XMPP account request
 * Inferred from Zod schema for type safety
 */
export type CreateXmppAccountRequest = z.infer<
  typeof CreateXmppAccountRequestSchema
>;

/**
 * Statuses allowed in an update request
 * Inferred from Zod schema
 */
export type UpdateXmppAccountStatus = z.infer<
  typeof UpdateXmppAccountStatusSchema
>;

/**
 * Update XMPP account request
 * Inferred from Zod schema for type safety
 */
export type UpdateXmppAccountRequest = z.infer<
  typeof UpdateXmppAccountRequestSchema
>;

/**
 * Prosody REST API error response
 */
export interface ProsodyRestError {
  error: string;
  message?: string;
}

/**
 * Prosody REST API account creation response
 */
export interface ProsodyRestAccountResponse {
  success?: boolean;
  error?: string;
  message?: string;
}
