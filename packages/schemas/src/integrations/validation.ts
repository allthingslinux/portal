// ============================================================================
// Integration Validation Utilities
// ============================================================================
// Pure validation functions used by integration schemas.
// These are co-located with schemas since they're used in Zod .refine() calls.

// --- IRC ---

/** Atheme NICKLEN 50 */
export const IRC_NICK_MAX_LENGTH = 50;

/**
 * RFC 1459: first character must be a letter; rest may be letter, digit, or [\]^_`{|}~-
 * Length 1..NICKLEN. No leading/trailing spaces.
 */
const IRC_NICK_REGEX = new RegExp(
  `^[a-zA-Z][a-zA-Z0-9[\\]\\\\^_\`{|}~-]{0,${IRC_NICK_MAX_LENGTH - 1}}$`
);

/** Validate IRC nick format (RFC 1459 style). */
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

// --- XMPP ---

const XMPP_USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}$/;
const XMPP_USERNAME_MIN_LENGTH = 1;
const XMPP_USERNAME_MAX_LENGTH = 63;

/** Validate XMPP username (localpart). */
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

// --- Mailcow ---

const MAILCOW_LOCAL_PART_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
const MAILCOW_LOCAL_PART_MIN_LENGTH = 1;
const MAILCOW_LOCAL_PART_MAX_LENGTH = 64;

/** Validate mailcow local_part (the part before @ in email). */
export function isValidMailcowLocalPart(localPart: string): boolean {
  if (!localPart || typeof localPart !== "string") {
    return false;
  }
  const trimmed = localPart.trim().toLowerCase();
  if (
    trimmed.length < MAILCOW_LOCAL_PART_MIN_LENGTH ||
    trimmed.length > MAILCOW_LOCAL_PART_MAX_LENGTH
  ) {
    return false;
  }
  return MAILCOW_LOCAL_PART_REGEX.test(trimmed);
}
