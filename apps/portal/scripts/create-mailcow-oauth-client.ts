import "dotenv/config";

/**
 * Create an OAuth2 client in mailcow for "Sign in with Mailcow".
 *
 * Calls mailcow API POST /api/v1/add/oauth2-client, then GET to retrieve
 * client_id and client_secret. Prints env vars for you to add to .env.
 *
 * Usage:
 *   pnpm create-mailcow-oauth-client
 *
 * Environment Variables:
 *   MAILCOW_API_URL  - Required. Base URL of mailcow (e.g. https://mail.atl.tools)
 *   MAILCOW_API_KEY  - Required. Read-write API key
 *   BETTER_AUTH_URL  - Required. Portal base URL (e.g. https://portal.atl.tools)
 */

const MAILCOW_API_URL = process.env.MAILCOW_API_URL?.replace(/\/$/, "");
const MAILCOW_API_KEY = process.env.MAILCOW_API_KEY;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");

async function createMailcowOAuthClient() {
  if (!(MAILCOW_API_URL && MAILCOW_API_KEY)) {
    console.error("❌ Missing MAILCOW_API_URL or MAILCOW_API_KEY");
    process.exit(1);
  }
  if (!BETTER_AUTH_URL) {
    console.error("❌ Missing BETTER_AUTH_URL (Portal base URL)");
    process.exit(1);
  }

  const redirectUri = `${BETTER_AUTH_URL}/api/auth/oauth2/callback/mailcow`;
  console.log("Creating OAuth2 client in mailcow...");
  console.log("  Redirect URI:", redirectUri);

  // Add OAuth2 client
  const addRes = await fetch(`${MAILCOW_API_URL}/api/v1/add/oauth2-client`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": MAILCOW_API_KEY,
    },
    body: JSON.stringify({ redirect_uri: redirectUri }),
  });

  if (!addRes.ok) {
    console.error("❌ Add failed:", addRes.status, await addRes.text());
    process.exit(1);
  }

  const addData = (await addRes.json()) as Array<{
    type: string;
    msg?: string[];
  }>;
  const first = addData[0];
  if (first?.type === "error" || first?.type === "danger") {
    console.error("❌ mailcow error:", first.msg?.join(" ") ?? addData);
    process.exit(1);
  }

  console.log("✓ OAuth2 client created");

  // Get all clients to retrieve client_id and client_secret
  const getRes = await fetch(
    `${MAILCOW_API_URL}/api/v1/get/oauth2-client/all`,
    {
      headers: { "X-API-Key": MAILCOW_API_KEY },
    }
  );

  if (!getRes.ok) {
    console.error("❌ Get clients failed:", getRes.status, await getRes.text());
    process.exit(1);
  }

  const clients = (await getRes.json()) as Array<{
    client_id?: string;
    client_secret?: string;
    redirect_uri?: string;
  }>;

  const client = Array.isArray(clients)
    ? (clients.find((c) => c.redirect_uri === redirectUri) ?? clients.at(-1))
    : null;

  if (!(client?.client_id && client?.client_secret)) {
    console.error(
      "❌ Could not retrieve client_id/client_secret. Response:",
      clients
    );
    process.exit(1);
  }

  console.log("\n✓ Add these to your .env:\n");
  console.log(`MAILCOW_OAUTH_CLIENT_ID=${client.client_id}`);
  console.log(`MAILCOW_OAUTH_CLIENT_SECRET=${client.client_secret}`);
  console.log("NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED=true");
  console.log("\nThen restart the app.");
}

createMailcowOAuthClient().catch((err) => {
  console.error("❌", err);
  process.exit(1);
});
