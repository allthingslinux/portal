import "server-only";

import { captureException } from "@sentry/nextjs";

import { keys } from "./keys";

const env = keys();

export const mailcowConfig = {
  apiUrl: env.MAILCOW_API_URL,
  apiKey: env.MAILCOW_API_KEY,
  domain: env.MAILCOW_DOMAIN || "",
} as const;

/**
 * Validate mailcow configuration lazily.
 * Only validates when actually needed (when mailcow operations are attempted).
 */
export function validateMailcowConfig(): void {
  if (!mailcowConfig.apiUrl) {
    const error = new Error("MAILCOW_API_URL environment variable is required");
    try {
      captureException(error, {
        tags: { type: "configuration_error", module: "mailcow_config" },
      });
    } catch {
      // Ignore Sentry failures
    }
    throw error;
  }

  if (!mailcowConfig.apiKey) {
    const error = new Error("MAILCOW_API_KEY environment variable is required");
    try {
      captureException(error, {
        tags: { type: "configuration_error", module: "mailcow_config" },
      });
    } catch {
      // Ignore Sentry failures
    }
    throw error;
  }

  if (!mailcowConfig.domain) {
    const error = new Error("MAILCOW_DOMAIN environment variable is required");
    try {
      captureException(error, {
        tags: { type: "configuration_error", module: "mailcow_config" },
      });
    } catch {
      // Ignore Sentry failures
    }
    throw error;
  }
}

/**
 * Check if mailcow is configured (non-throwing).
 */
export function isMailcowConfigured(): boolean {
  return !!(
    mailcowConfig.apiUrl &&
    mailcowConfig.apiKey &&
    mailcowConfig.domain
  );
}
