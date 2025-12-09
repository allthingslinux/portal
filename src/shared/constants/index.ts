/**
 * Application-wide constants
 *
 * This file contains magic numbers and commonly used values that should be
 * centralized for maintainability and consistency.
 */

/**
 * Bcrypt hashing rounds for password encryption
 * Higher values are more secure but slower
 */
export const BCRYPT_ROUNDS = 10;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Minimum password length requirement
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * Maximum password length
 */
export const PASSWORD_MAX_LENGTH = 99;

/**
 * Default page size for pagination
 */
export const DEFAULT_PAGE_SIZE = 10;
