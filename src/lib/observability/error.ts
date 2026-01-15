import { captureException } from "@sentry/nextjs";

import { log } from "@/lib/observability/log";

/**
 * Parse an error into a human-readable string message.
 * Pure function with no side effects.
 */
export const parseError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return String(error);
};

/**
 * Capture an error to Sentry with optional context.
 * This function has side effects (captures to Sentry, logs).
 */
export const captureError = (
  error: unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void => {
  try {
    captureException(error, context);
    const message = parseError(error);
    log.error(`Error captured: ${message}`);
  } catch (sentryError) {
    // Fallback error logging when Sentry fails
    // eslint-disable-next-line no-console
    console.error("Failed to capture error to Sentry:", sentryError);
    // eslint-disable-next-line no-console
    console.error("Original error:", parseError(error));
  }
};
