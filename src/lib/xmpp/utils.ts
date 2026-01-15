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
 * Validate an XMPP localpart (username) according to allowed characters and length.
 *
 * The localpart must start with a letter or digit, may contain letters, digits, `.`, `_`, or `-`,
 * and must be between 1 and 63 characters long.
 *
 * @returns `true` if `username` meets these rules, `false` otherwise.
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
 * Derives a valid XMPP username from the local part of an email address.
 *
 * @param email - The email address to derive the username from (e.g., "user@example.com").
 * @returns The sanitized username suitable for use as an XMPP localpart.
 * @throws Error if `email` is not a non-empty string or if a valid username cannot be generated.
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
 * Create a full XMPP JID from a valid localpart and domain.
 *
 * @param username - XMPP localpart; must satisfy the XMPP username rules or an error is thrown
 * @param domain - XMPP domain (e.g., "xmpp.atl.chat"); must be a non-empty string
 * @returns The full JID in the form `username@domain`
 * @throws Error if `username` is invalid or if `domain` is missing or not a string
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
 * Parse a full JID into its localpart (`username`) and host (`domain`).
 *
 * @param jid - Full JID (for example, "username@xmpp.atl.chat")
 * @returns An object containing `username` (the localpart) and `domain` (the host)
 * @throws Error if `jid` is not a string or does not contain exactly one `@` with non-empty parts
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
 * Type guard that checks whether a status string is an allowed XMPP account status.
 *
 * @param status - Status string to validate
 * @returns `true` if `status` is one of `"active"`, `"suspended"`, or `"deleted"`, `false` otherwise
 */
export function isValidXmppAccountStatus(
  status: string
): status is XmppAccountStatus {
  return (["active", "suspended", "deleted"] as const).includes(
    status as XmppAccountStatus
  );
}