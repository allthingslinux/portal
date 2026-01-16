import "dotenv/config";

import { randomBytes, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { oauthClient } from "@/lib/db/schema/oauth";

// ============================================================================
// Create Prosody OAuth Client Script
// ============================================================================
// This script registers Prosody XMPP server as an OAuth client in Better Auth.
// It creates a confidential client with password grant type for legacy XMPP
// client support.
//
// Usage:
//   pnpm create-prosody-oauth-client
//
// Environment Variables:
//   PROSODY_CLIENT_NAME - Name for the OAuth client (default: "Prosody XMPP Server")
//   PROSODY_CLIENT_ID - Custom client ID (optional, auto-generated if not provided)
//
// Output:
//   Prints the client_id and client_secret that should be set in Prosody
//   configuration as PROSODY_OAUTH_CLIENT_ID and PROSODY_OAUTH_CLIENT_SECRET

async function createProsodyOAuthClient() {
  const clientName = process.env.PROSODY_CLIENT_NAME || "Prosody XMPP Server";
  const customClientId = process.env.PROSODY_CLIENT_ID;

  try {
    // Check if Prosody client already exists
    const existingClient = await db
      .select()
      .from(oauthClient)
      .where(eq(oauthClient.name, clientName))
      .limit(1);

    if (existingClient.length > 0) {
      const client = existingClient[0];
      console.log("ℹ️  Prosody OAuth client already exists:");
      console.log("   Client ID:", client.clientId);
      console.log(
        "   Client Secret:",
        client.clientSecret ? "(set - not displayed for security)" : "(not set)"
      );
      console.log("   Name:", client.name);
      console.log("   Disabled:", client.disabled);
      return;
    }

    // Generate client ID and secret
    // Use randomBytes for secure random generation
    const generateRandomString = (length: number) =>
      randomBytes(length).toString("base64url").slice(0, length);
    const clientId = customClientId || `prosody_${generateRandomString(32)}`;
    const clientSecret = generateRandomString(64);

    // Create OAuth client in database
    const [newClient] = await db
      .insert(oauthClient)
      .values({
        id: randomUUID(),
        clientId,
        clientSecret,
        name: clientName,
        redirectUris: [], // Not needed for server-to-server auth
        grantTypes: ["authorization_code", "password"], // Password grant for legacy clients
        tokenEndpointAuthMethod: "client_secret_post", // Prosody will use POST for auth
        scopes: ["openid", "xmpp"], // Required scopes
        skipConsent: true, // Trusted first-party client
        public: false, // Confidential client
        disabled: false,
      })
      .returning();

    if (!newClient) {
      throw new Error("Failed to create OAuth client: No client returned");
    }

    console.log("✅ Prosody OAuth client created successfully!");
    console.log("");
    console.log("📋 Configuration for Prosody:");
    console.log(`   PROSODY_OAUTH_CLIENT_ID=${newClient.clientId}`);
    console.log(`   PROSODY_OAUTH_CLIENT_SECRET=${newClient.clientSecret}`);
    console.log("");
    console.log("⚠️  Store these credentials securely!");
    console.log(
      "   Add them to your Prosody environment variables or .env file."
    );
  } catch (error) {
    console.error("❌ Failed to create Prosody OAuth client:");
    if (error instanceof Error) {
      console.error("   Error:", error.message);
      if (error.stack) {
        console.error("   Stack:", error.stack);
      }
    } else {
      console.error("   Error:", error);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createProsodyOAuthClient()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createProsodyOAuthClient };
