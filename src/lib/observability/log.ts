/**
 * Structured logging using Sentry's logger
 * Provides consistent, queryable logs across all environments
 */

interface LogAttributes {
  [key: string]: unknown;
}

const getSentryLogger = () => {
  try {
    // Dynamic import to handle server/client differences
    const Sentry = require("@sentry/nextjs");
    return Sentry.logger;
  } catch {
    // Fallback to console if Sentry not available
    return null;
  }
};

const createLogger = () => {
  const sentryLogger = getSentryLogger();

  return {
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
};

export const log = createLogger();
