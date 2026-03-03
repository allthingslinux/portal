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
 * Get environment context that should be included in all logs.
 * Captured once at module load for performance.
 */
const getEnvContext = (): Record<string, string | undefined> => {
  return {
    // Deployment info
    commit_hash:
      process.env.GIT_COMMIT_SHA ||
      process.env.COMMIT_SHA ||
      process.env.GIT_COMMIT,
    version:
      process.env.SENTRY_RELEASE ||
      process.env.SERVICE_VERSION ||
      process.env.npm_package_version,
    deployment_id: process.env.DEPLOYMENT_ID,
    deploy_time: process.env.DEPLOY_TIMESTAMP,

    // Infrastructure
    service: process.env.SERVICE_NAME || "portal",
    region: process.env.AWS_REGION || process.env.REGION,
    availability_zone: process.env.AWS_AVAILABILITY_ZONE,
    instance_id: process.env.INSTANCE_ID || process.env.HOSTNAME,
    container_id: process.env.CONTAINER_ID,

    // Runtime
    node_version: process.version,
    runtime: process.env.AWS_EXECUTION_ENV || "node",
    memory_limit_mb: process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE,

    // Environment type
    environment: process.env.NODE_ENV || process.env.ENVIRONMENT,
    stage: process.env.STAGE,
  };
};

// Capture environment context once at module load
const envContext = getEnvContext();

/**
 * Merge attributes with environment context for structured logging.
 * Environment context is automatically included in all log entries.
 */
const enrichWithEnvContext = (attributes?: LogAttributes): LogAttributes => {
  // Filter out undefined values from env context
  const filteredEnvContext: Record<string, string> = {};
  for (const [key, value] of Object.entries(envContext)) {
    if (value !== undefined) {
      filteredEnvContext[key] = value;
    }
  }

  return {
    ...filteredEnvContext,
    ...attributes,
  };
};

/**
 * Structured logging using Sentry's logger
 * Provides consistent, queryable logs across all environments
 *
 * All logs automatically include environment context (commit hash, version, etc.)
 * for powerful debugging and analytics.
 *
 * @example
 * ```ts
 * log.info("User logged in", { userId: "123", email: "user@example.com" });
 * // Automatically includes: commit_hash, version, service, environment, etc.
 * ```
 */
export const log = {
  trace: (message: string, attributes?: LogAttributes) => {
    const enriched = enrichWithEnvContext(attributes);
    if (sentryLogger) {
      sentryLogger.trace(message, enriched);
    } else {
      console.log("[TRACE]", message, enriched);
    }
  },

  debug: (message: string, attributes?: LogAttributes) => {
    const enriched = enrichWithEnvContext(attributes);
    if (sentryLogger) {
      sentryLogger.debug(message, enriched);
    } else if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG]", message, enriched);
    }
  },

  info: (message: string, attributes?: LogAttributes) => {
    const enriched = enrichWithEnvContext(attributes);
    if (sentryLogger) {
      sentryLogger.info(message, enriched);
    } else {
      console.info("[INFO]", message, enriched);
    }
  },

  warn: (message: string, attributes?: LogAttributes) => {
    const enriched = enrichWithEnvContext(attributes);
    if (sentryLogger) {
      sentryLogger.warn(message, enriched);
    } else {
      console.warn("[WARN]", message, enriched);
    }
  },

  error: (message: string, attributes?: LogAttributes) => {
    const enriched = enrichWithEnvContext(attributes);
    if (sentryLogger) {
      sentryLogger.error(message, enriched);
    } else {
      console.error("[ERROR]", message, enriched);
    }
  },

  fatal: (message: string, attributes?: LogAttributes) => {
    const enriched = enrichWithEnvContext(attributes);
    if (sentryLogger) {
      sentryLogger.fatal(message, enriched);
    } else {
      console.error("[FATAL]", message, enriched);
    }
  },
};
