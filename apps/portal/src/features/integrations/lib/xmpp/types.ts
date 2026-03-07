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
} from "@portal/schemas/integrations/xmpp";

/**
 * Prosody REST API error response.
 * Supports both the legacy format (error/message) and the newer
 * util.error format (type/condition/text/code) from mod_http_admin_api >= 2025-10-01.
 */
export interface ProsodyRestError {
  code?: number;
  condition?: string;
  // Legacy format
  error?: string;
  message?: string;
  text?: string;
  // util.error format (Prosody trunk / mod_http_admin_api post-2025-10-01)
  type?: string;
}

/**
 * Prosody REST API account creation response
 */
export interface ProsodyRestAccountResponse {
  error?: string;
  message?: string;
  success?: boolean;
}
