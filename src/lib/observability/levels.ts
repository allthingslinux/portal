/**
 * Event level utilities for setting severity levels
 */

type SentryLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

/**
 * Set level for current scope
 */
export const setLevel = (level: SentryLevel): void => {
  try {
    const { getCurrentScope } = require("@sentry/nextjs");
    getCurrentScope().setLevel(level);
  } catch {
    // Sentry not available
  }
};

/**
 * Capture message with specific level
 */
export const captureMessageWithLevel = (
  message: string,
  level: SentryLevel
): void => {
  try {
    const { captureMessage } = require("@sentry/nextjs");
    captureMessage(message, level);
  } catch {
    // Sentry not available
  }
};

/**
 * Capture exception with specific level
 */
export const captureExceptionWithLevel = (
  error: unknown,
  level: SentryLevel
): void => {
  try {
    const { withScope, captureException } = require("@sentry/nextjs");
    withScope((scope: { setLevel: (level: string) => void }) => {
      scope.setLevel(level);
      captureException(error);
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Common level patterns for Portal
 */
export const levelPatterns = {
  // Critical system failures
  fatal: (error: unknown) => captureExceptionWithLevel(error, "fatal"),

  // Application errors that need attention
  error: (error: unknown) => captureExceptionWithLevel(error, "error"),

  // Potential issues or degraded performance
  warning: (message: string) => captureMessageWithLevel(message, "warning"),

  // General operational information
  info: (message: string) => captureMessageWithLevel(message, "info"),

  // Detailed debugging information
  debug: (message: string) => captureMessageWithLevel(message, "debug"),
};
