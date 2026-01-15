// ============================================================================
// XMPP Utilities
// ============================================================================
// Utility functions for XMPP account management

import type { XmppAccountStatus } from "./types";

/**
 * XMPP localpart (username) validation rules:
 * - Alphanumeric characters (a-z, A-Z, 0-9)
 * - Underscore (_)
 * - Hyphen (-)
 * - Dot (.)
 * - Must start with a letter or number
 * - Length: 1-1023 characters (XMPP spec allows up to 1023, but we'll use a reasonable limit)
 */
const XMPP_USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}$/;
const XMPP_USERNAME_MIN_LENGTH = 1;
const XMPP_USERNAME_MAX_LENGTH = 63; // Reasonable limit for usernames
const XMPP_USERNAME_SANITIZE_REGEX = /[^a-zA-Z0-9._-]/g;
const XMPP_USERNAME_START_REGEX = /^[^a-zA-Z0-9]/;

/**
 * Validate XMPP username (localpart)
 * @param username - The username to validate
 * @returns true if valid, false otherwise
 */
export function isValidXmppUsername(username: string): boolean {
  if (!username || typeof username !== "string") {
    return false;
  }

  if (
    username.length < XMPP_USERNAME_MIN_LENGTH ||
    username.length > XMPP_USERNAME_MAX_LENGTH
  ) {
    return false;
  }

  return XMPP_USERNAME_REGEX.test(username);
}

/**
 * Generate XMPP username from email address
 * Extracts the localpart (part before @) from an email
 * @param email - Email address (e.g., "user@example.com")
 * @returns Username derived from email localpart
 */
export function generateUsernameFromEmail(email: string): string {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email address");
  }

  const localpart = email.split("@")[0]?.toLowerCase() || "";

  // Sanitize: remove invalid characters, keep only valid XMPP characters
  const sanitized = localpart
    .replace(XMPP_USERNAME_SANITIZE_REGEX, "")
    .replace(XMPP_USERNAME_START_REGEX, "") // Ensure starts with alphanumeric
    .slice(0, XMPP_USERNAME_MAX_LENGTH);

  if (!sanitized || sanitized.length < XMPP_USERNAME_MIN_LENGTH) {
    throw new Error(`Cannot generate valid XMPP username from email: ${email}`);
  }

  return sanitized;
}

/**
 * Format JID from username and domain
 * @param username - XMPP localpart (username)
 * @param domain - XMPP domain (e.g., "xmpp.atl.chat")
 * @returns Full JID (e.g., "username@xmpp.atl.chat")
 */
export function formatJid(username: string, domain: string): string {
  if (!isValidXmppUsername(username)) {
    throw new Error(`Invalid XMPP username: ${username}`);
  }

  if (!domain || typeof domain !== "string") {
    throw new Error("Invalid XMPP domain");
  }

  return `${username}@${domain}`;
}

/**
 * Parse JID into username and domain
 * @param jid - Full JID (e.g., "username@xmpp.atl.chat")
 * @returns Object with username and domain
 */
export function parseJid(jid: string): { username: string; domain: string } {
  if (!jid || typeof jid !== "string") {
    throw new Error("Invalid JID");
  }

  const parts = jid.split("@");
  if (parts.length !== 2) {
    throw new Error(`Invalid JID format: ${jid}`);
  }

  const [username, domain] = parts;
  if (!(username && domain)) {
    throw new Error(`Invalid JID format: ${jid}`);
  }

  return { username, domain };
}

/**
 * Validate XMPP account status
 * @param status - Status to validate
 * @returns true if valid, false otherwise
 */
export function isValidXmppAccountStatus(
  status: string
): status is XmppAccountStatus {
  return (["active", "suspended", "deleted"] as const).includes(
    status as XmppAccountStatus
  );
}
