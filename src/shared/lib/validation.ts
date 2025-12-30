/**
 * Shared validation utilities
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address format
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
