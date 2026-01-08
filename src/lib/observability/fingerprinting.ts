/**
 * Event fingerprinting utilities for better error grouping
 */

/**
 * Set fingerprint for current scope
 */
export const setFingerprint = (fingerprint: string[]): void => {
  try {
    const { withScope } = require("@sentry/nextjs");
    withScope((scope: { setFingerprint: (fingerprint: string[]) => void }) => {
      scope.setFingerprint(fingerprint);
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Common fingerprinting patterns for Portal
 */
export const fingerprintPatterns = {
  // API errors grouped by endpoint and status
  apiError: (endpoint: string, method: string, statusCode: number) => [
    "api-error",
    endpoint,
    method,
    String(statusCode),
  ],

  // Database errors grouped by operation and table
  databaseError: (operation: string, table: string) => [
    "database-error",
    operation,
    table,
  ],

  // Auth errors grouped by provider and type
  authError: (provider: string, errorType: string) => [
    "auth-error",
    provider,
    errorType,
  ],

  // Validation errors grouped by field
  validationError: (field: string, rule: string) => [
    "validation-error",
    field,
    rule,
  ],

  // External service errors grouped by service
  externalServiceError: (service: string, operation: string) => [
    "external-service-error",
    service,
    operation,
  ],

  // Generic errors that should be grouped aggressively
  genericError: (errorType: string) => [errorType],

  // Errors that should use default grouping plus context
  contextualError: (context: string) => ["{{ default }}", context],
};

import type { Event, EventHint } from "@sentry/types";

// Use official Sentry types instead of custom interfaces
type SentryEvent = Event;
type SentryHint = EventHint;

/**
 * Process API error fingerprinting
 */
const processApiError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (exception?.name === "ApiError" || exception?.statusCode) {
    const endpoint = exception.endpoint || exception.url || "unknown";
    const method = exception.method || "unknown";
    const statusCode = exception.statusCode || exception.status || 0;

    event.fingerprint = fingerprintPatterns.apiError(
      endpoint,
      method,
      statusCode
    );
    return true;
  }
  return false;
};

/**
 * Process database error fingerprinting
 */
const processDatabaseError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (
    exception?.name?.includes("Database") ||
    exception?.code?.startsWith("P")
  ) {
    const operation = exception.operation || "unknown";
    const table = exception.table || exception.model || "unknown";

    event.fingerprint = fingerprintPatterns.databaseError(operation, table);
    return true;
  }
  return false;
};

/**
 * Process auth error fingerprinting
 */
const processAuthError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (exception?.name?.includes("Auth") || exception?.provider) {
    const provider = exception.provider || "unknown";
    const errorType = exception.type || exception.code || "unknown";

    event.fingerprint = fingerprintPatterns.authError(provider, errorType);
    return true;
  }
  return false;
};

/**
 * Process validation error fingerprinting
 */
const processValidationError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (exception?.name?.includes("Validation") || exception?.field) {
    const field = exception.field || exception.path || "unknown";
    const rule = exception.rule || exception.constraint || "unknown";

    event.fingerprint = fingerprintPatterns.validationError(field, rule);
    return true;
  }
  return false;
};

/**
 * Initialize fingerprinting in beforeSend hook
 */
export const initializeFingerprinting = (): void => {
  try {
    const { addEventProcessor } = require("@sentry/nextjs");

    addEventProcessor((event: SentryEvent, hint: SentryHint) => {
      const exception = hint?.originalException;

      if (!(exception && event)) {
        return event;
      }

      // Try each error type processor
      if (processApiError(event, exception)) {
        return event;
      }
      if (processDatabaseError(event, exception)) {
        return event;
      }
      if (processAuthError(event, exception)) {
        return event;
      }
      if (processValidationError(event, exception)) {
        return event;
      }

      return event;
    });
  } catch {
    // Sentry not available
  }
};
