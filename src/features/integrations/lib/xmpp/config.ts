import "server-only";

import { captureException } from "@sentry/nextjs";

import { keys } from "./keys";

// ============================================================================
// XMPP Configuration
// ============================================================================
// Configuration for Prosody XMPP server integration
// Uses validated environment variables via keys.ts

const env = keys();

export const xmppConfig = {
  // XMPP domain (e.g., "xmpp.atl.chat")
  domain: env.XMPP_DOMAIN || "xmpp.atl.chat",

  // Prosody REST API configuration
  prosody: {
    // REST API endpoint URL
    // Use internal Docker network URL for same-network communication
    // or public URL if Prosody is on a different network
    restUrl: env.PROSODY_REST_URL,

    // Username for REST API authentication (admin JID)
    // Format: "admin@xmpp.atl.chat" or from PROSODY_ADMIN_JID
    username:
      env.PROSODY_REST_USERNAME ||
      env.PROSODY_ADMIN_JID ||
      "admin@xmpp.atl.chat",

    // Password/secret for REST API authentication (component secret)
    // Same as PROSODY_REST_SECRET in Prosody configuration
    password: env.PROSODY_REST_PASSWORD || env.PROSODY_REST_SECRET,
  },
} as const;

/**
 * Validate XMPP configuration lazily
 * Only validates when actually needed (when XMPP operations are attempted)
 * This prevents blocking the entire application if XMPP is not configured
 */
export function validateXmppConfig(): void {
  if (!xmppConfig.prosody.password) {
    const error = new Error(
      "PROSODY_REST_PASSWORD or PROSODY_REST_SECRET environment variable is required"
    );
    // Capture to Sentry before throwing (if Sentry is initialized)
    try {
      captureException(error, {
        tags: {
          type: "configuration_error",
          module: "xmpp_config",
          missing_var: "PROSODY_REST_PASSWORD or PROSODY_REST_SECRET",
        },
        level: "error",
      });
    } catch {
      // Sentry might not be initialized yet, continue to throw
    }
    throw error;
  }

  if (!xmppConfig.prosody.restUrl) {
    const error = new Error(
      "PROSODY_REST_URL environment variable is required"
    );
    // Capture to Sentry before throwing (if Sentry is initialized)
    try {
      captureException(error, {
        tags: {
          type: "configuration_error",
          module: "xmpp_config",
          missing_var: "PROSODY_REST_URL",
        },
        level: "error",
      });
    } catch {
      // Sentry might not be initialized yet, continue to throw
    }
    throw error;
  }
}

/**
 * Check if XMPP is configured (non-throwing)
 */
export function isXmppConfigured(): boolean {
  return !!(xmppConfig.prosody.password && xmppConfig.prosody.restUrl);
}
