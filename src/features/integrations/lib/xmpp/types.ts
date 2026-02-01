// ============================================================================
// XMPP Types
// ============================================================================
// TypeScript types for XMPP account management and Prosody REST API
// Types are inferred from Zod schemas for single source of truth

export type {
  CreateXmppAccountRequest,
  UpdateXmppAccountRequest,
  UpdateXmppAccountStatus,
  XmppAccount,
  XmppAccountStatus,
} from "@/shared/schemas/integrations/xmpp";

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
