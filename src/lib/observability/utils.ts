/**
 * Observability utilities for error handling and logging
 */

import { captureException } from "@sentry/nextjs";

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

const getSentryLogger = () => {
  try {
    const Sentry = require("@sentry/nextjs");
    return Sentry.logger;
  } catch {
    return null;
  }
};

const sentryLogger = getSentryLogger();

interface LogAttributes {
  [key: string]: unknown;
}

/**
 * Structured logging using Sentry's logger
 * Provides consistent, queryable logs across all environments
 */
export const log = {
  trace: (message: string, attributes?: LogAttributes) => {
    if (sentryLogger) {
      sentryLogger.trace(message, attributes);
    } else {
      console.log("[TRACE]", message, attributes);
    }
  },

  debug: (message: string, attributes?: LogAttributes) => {
    if (sentryLogger) {
      sentryLogger.debug(message, attributes);
    } else if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG]", message, attributes);
    }
  },

  info: (message: string, attributes?: LogAttributes) => {
    if (sentryLogger) {
      sentryLogger.info(message, attributes);
    } else {
      console.info("[INFO]", message, attributes);
    }
  },

  warn: (message: string, attributes?: LogAttributes) => {
    if (sentryLogger) {
      sentryLogger.warn(message, attributes);
    } else {
      console.warn("[WARN]", message, attributes);
    }
  },

  error: (message: string, attributes?: LogAttributes) => {
    if (sentryLogger) {
      sentryLogger.error(message, attributes);
    } else {
      console.error("[ERROR]", message, attributes);
    }
  },

  fatal: (message: string, attributes?: LogAttributes) => {
    if (sentryLogger) {
      sentryLogger.fatal(message, attributes);
    } else {
      console.error("[FATAL]", message, attributes);
    }
  },
};
