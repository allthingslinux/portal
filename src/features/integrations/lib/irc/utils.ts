// ============================================================================
// IRC Utilities
// ============================================================================
// Nick validation (RFC 1459 / is_valid_nick style) and password generation

import { randomBytes } from "node:crypto";

/** Atheme NICKLEN 50, PASSLEN 288. We use 50 for nick, 24 for generated password. */
export const IRC_NICK_MAX_LENGTH = 50;
const IRC_PASSWORD_LENGTH = 24;

/**
 * Valid nick: letters, digits, [\]^_`{|}~ and - (RFC 1459).
 * No spaces, no leading/trailing spaces; length 1..NICKLEN.
 */
const IRC_NICK_REGEX = /^[a-zA-Z0-9[\]\\^_`{|}~-]{1,50}$/;

/**
 * Validate IRC nick (RFC 1459 style). Password must not equal nick (Atheme).
 */
export function isValidIrcNick(nick: string): boolean {
  if (!nick || typeof nick !== "string") {
    return false;
  }
  const trimmed = nick.trim();
  return (
    trimmed.length >= 1 &&
    trimmed.length <= IRC_NICK_MAX_LENGTH &&
    IRC_NICK_REGEX.test(trimmed)
  );
}

/**
 * Generate a cryptographically random password for NickServ REGISTER.
 * Not stored; shown once to the user.
 */
export function generateIrcPassword(): string {
  return randomBytes(IRC_PASSWORD_LENGTH)
    .toString("base64url")
    .slice(0, IRC_PASSWORD_LENGTH);
}
