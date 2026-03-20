import "server-only";

import { APIError } from "@portal/api/utils";
import { captureException } from "@sentry/nextjs";

import { keys } from "./keys";

// ============================================================================
// XMPP Configuration
// ============================================================================
// Configuration for Prosody XMPP server integration
// Uses validated environment variables via keys.ts

const env = keys();

export const xmppConfig = {
  // XMPP domain (e.g., "atl.chat")
  domain: env.XMPP_DOMAIN || "atl.chat",

  // Prosody REST API configuration
  prosody: {
    // REST API endpoint URL (mod_http_admin_api)
    // Use internal Docker network URL for same-network communication
    restUrl: env.PROSODY_REST_URL,

    // Bearer token for mod_http_admin_api (mod_tokenauth in Prosody 13+)
    // Generate via prosodyctl or OAuth2 client credentials grant
    token: env.PROSODY_REST_TOKEN,
  },
} as const;

/**
 * Validate XMPP configuration lazily
 * Only validates when actually needed (when XMPP operations are attempted)
 * This prevents blocking the entire application if XMPP is not configured
 */
export function validateXmppConfig(): void {
  if (!xmppConfig.prosody.token) {
    const msg =
      "PROSODY_REST_TOKEN environment variable is required (Bearer token for mod_http_admin_api)";
    try {
      captureException(new Error(msg), {
        tags: {
          type: "configuration_error",
          module: "xmpp_config",
          missing_var: "PROSODY_REST_TOKEN",
        },
        level: "error",
      });
    } catch {
      // Sentry might not be initialized yet, continue to throw
    }
    throw new APIError(msg, 503);
  }

  if (!xmppConfig.prosody.restUrl) {
    const msg = "PROSODY_REST_URL environment variable is required";
    try {
      captureException(new Error(msg), {
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
    throw new APIError(msg, 503);
  }
}

/**
 * Check if XMPP is configured (non-throwing)
 */
export function isXmppConfigured(): boolean {
  return !!(xmppConfig.prosody.token && xmppConfig.prosody.restUrl);
}
