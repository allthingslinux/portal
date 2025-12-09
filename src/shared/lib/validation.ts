/**
 * Shared validation utilities
 *
 * Common validation functions that can be reused across the application.
 * These complement Zod schemas by providing reusable validation logic.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHARS_REGEX = /[!@#$%^&*(),.?":{}|<>]/g;
const NUMERIC_REGEX = /\d/g;
const UPPERCASE_REGEX = /[A-Z]/;

/**
 * Validates an email address format
 *
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates password strength based on requirements
 *
 * @param password - Password to validate
 * @param options - Validation options
 * @returns Object with validation result and errors
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    maxLength?: number;
    requireSpecialChars?: boolean;
    requireNumbers?: boolean;
    requireUppercase?: boolean;
  } = {}
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const {
    minLength = 8,
    maxLength = 99,
    requireSpecialChars = false,
    requireNumbers = false,
    requireUppercase = false,
  } = options;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (password.length > maxLength) {
    errors.push(`Password must be no more than ${maxLength} characters long`);
  }

  if (requireSpecialChars) {
    const specialCharsCount = password.match(SPECIAL_CHARS_REGEX)?.length ?? 0;

    if (specialCharsCount < 1) {
      errors.push("Password must contain at least one special character");
    }
  }

  if (requireNumbers) {
    const numbersCount = password.match(NUMERIC_REGEX)?.length ?? 0;

    if (numbersCount < 1) {
      errors.push("Password must contain at least one number");
    }
  }

  if (requireUppercase && !UPPERCASE_REGEX.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
