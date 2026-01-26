/**
 * Shared constants
 */

/**
 * User roles
 */
export const USER_ROLES = {
  USER: "user",
  STAFF: "staff",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Permission scopes
 */
export const PERMISSIONS = {
  USER_LIST: "user:list",
  USER_VIEW: "user:view",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  ADMIN_VIEW: "admin:view",
} as const;

/**
 * API response status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common date formats
 */
export const DATE_FORMATS = {
  ISO: "yyyy-MM-dd",
  DISPLAY: "PPp", // e.g., "Apr 29th, 2021"
  SHORT: "PP", // e.g., "Apr 29, 2021"
  TIME: "p", // e.g., "4:30 PM"
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

/**
 * Mobile breakpoint (matches Tailwind's `md` breakpoint)
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
