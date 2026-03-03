// ============================================================================
// mailcow Utilities
// ============================================================================
// Utility functions for mailcow account management

/**
 * mailcow local_part (email username) validation rules:
 * - Alphanumeric characters (a-z, A-Z, 0-9)
 * - Underscore (_)
 * - Hyphen (-)
 * - Dot (.)
 * - Must start with a letter or number
 * - No @ or spaces
 */
const MAILCOW_LOCAL_PART_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
const MAILCOW_LOCAL_PART_MIN_LENGTH = 1;
const MAILCOW_LOCAL_PART_MAX_LENGTH = 64;

/**
 * Validate mailcow local_part (the part before @ in email).
 */
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

/**
 * Format full email from local_part and domain.
 */
export function formatEmail(localPart: string, domain: string): string {
  if (!isValidMailcowLocalPart(localPart)) {
    throw new Error(`Invalid mailcow local_part: ${localPart}`);
  }
  if (!domain || typeof domain !== "string" || domain.includes("@")) {
    throw new Error("Invalid mailcow domain");
  }
  return `${localPart.toLowerCase()}@${domain}`;
}
