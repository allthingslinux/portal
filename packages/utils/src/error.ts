/**
 * Error formatting utilities
 */

/**
 * Format an error message for display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

/**
 * Check if error is an instance of a specific error class
 */
export function isErrorOfType<T extends Error>(
  error: unknown,
  ErrorClass: new (...args: unknown[]) => T
): error is T {
  return error instanceof ErrorClass;
}

/**
 * Extract error details for logging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  name?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }
  return {
    message: formatError(error),
  };
}
