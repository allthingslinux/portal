import "server-only";

// ============================================================================
// XMPP Configuration
// ============================================================================
// Configuration for Prosody XMPP server integration
// Reads from environment variables

export const xmppConfig = {
  // XMPP domain (e.g., "xmpp.atl.chat")
  domain: process.env.XMPP_DOMAIN || "xmpp.atl.chat",

  // Prosody REST API configuration
  prosody: {
    // REST API endpoint URL
    // Use internal Docker network URL for same-network communication
    // or public URL if Prosody is on a different network
    restUrl: process.env.PROSODY_REST_URL || "http://localhost:5281/rest",

    // Username for REST API authentication (admin JID)
    // Format: "admin@xmpp.atl.chat" or from PROSODY_ADMIN_JID
    username:
      process.env.PROSODY_REST_USERNAME ||
      process.env.PROSODY_ADMIN_JID ||
      "admin@xmpp.atl.chat",

    // Password/secret for REST API authentication (component secret)
    // Same as PROSODY_REST_SECRET in Prosody configuration
    password:
      process.env.PROSODY_REST_PASSWORD || process.env.PROSODY_REST_SECRET,
  },
} as const;

// Validate configuration
if (!xmppConfig.prosody.password) {
  throw new Error(
    "PROSODY_REST_PASSWORD or PROSODY_REST_SECRET environment variable is required"
  );
}

if (!xmppConfig.prosody.restUrl) {
  throw new Error("PROSODY_REST_URL environment variable is required");
}
