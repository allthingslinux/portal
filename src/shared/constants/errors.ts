/**
 * Error message constants
 *
 * These constants provide consistent error messages across the application.
 * For user-facing errors, prefer using i18n keys instead.
 */

/**
 * API error messages
 */
export const API_ERRORS = {
  USER_ALREADY_REGISTERED: "User already registered",
  FAILED_TO_CREATE_USER: "Failed to create user",
  INVALID_REQUEST_BODY: "Invalid request body",
  CAPTCHA_TOKEN_REQUIRED: "Captcha token is required",
  ACCOUNT_NOT_FOUND: "Account not found",
  WORKSPACE_NOT_FOUND: "Workspace not found",
} as const;
