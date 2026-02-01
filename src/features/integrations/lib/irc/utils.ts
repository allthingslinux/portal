// ============================================================================
// IRC Utilities
// ============================================================================
// Nick validation (RFC 1459 / is_valid_nick style) and password generation

import { randomBytes } from "node:crypto";

/** Atheme NICKLEN 50, PASSLEN 288. We use 50 for nick, 24 for generated password. */
export const IRC_NICK_MAX_LENGTH = 50;
const IRC_PASSWORD_LENGTH = 24;

/**
 * RFC 1459: first character must be a letter; rest may be letter, digit, or [\]^_`{|}~-
 * Length 1..NICKLEN. No leading/trailing spaces.
 */
const IRC_NICK_REGEX = new RegExp(
  `^[a-zA-Z][a-zA-Z0-9[\\]\\\\^_\`{|}~-]{0,${IRC_NICK_MAX_LENGTH - 1}}$`
);

/**
 * Validate IRC nick format (RFC 1459 style). Does not check password rules.
 */
export function isValidIrcNick(nick: string): boolean {
  if (!nick || typeof nick !== "string") {
    return false;
  }
  if (nick !== nick.trim()) {
    return false;
  }
  return (
    nick.length >= 1 &&
    nick.length <= IRC_NICK_MAX_LENGTH &&
    IRC_NICK_REGEX.test(nick)
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
