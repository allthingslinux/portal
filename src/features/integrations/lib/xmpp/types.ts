// ============================================================================
// XMPP Types
// ============================================================================
// TypeScript types for XMPP account management and Prosody REST API

/**
 * XMPP account status
 */
export type XmppAccountStatus = "active" | "suspended" | "deleted";

/**
 * XMPP account information
 */
export interface XmppAccount {
  id: string;
  userId: string;
  integrationId: "xmpp"; // Integration identifier
  jid: string; // Full JID: username@xmpp.atl.chat
  username: string; // XMPP localpart (username)
  status: XmppAccountStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Create XMPP account request
 */
export interface CreateXmppAccountRequest extends Record<string, unknown> {
  username?: string; // Optional, defaults to email localpart
}

/**
 * Update XMPP account request
 */
export interface UpdateXmppAccountRequest extends Record<string, unknown> {
  username?: string; // Optional, must be unique
  status?: XmppAccountStatus; // Optional: "active" | "suspended" | "deleted"
  metadata?: Record<string, unknown>; // Optional JSONB
}

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
