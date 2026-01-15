import "server-only";

import { xmppConfig } from "./config";
import type { ProsodyRestAccountResponse, ProsodyRestError } from "./types";
import { formatJid } from "./utils";

// ============================================================================
// Prosody REST API Client
// ============================================================================
// Client for interacting with Prosody's mod_rest API
// Uses HTTP Basic authentication with admin JID and component secret
//
// Documentation: https://modules.prosody.im/mod_rest.html

/**
 * Builds the HTTP Basic Authorization header for the Prosody REST API using configured credentials.
 *
 * @returns The Authorization header string in the form `Basic <base64(username:password)>`
 */
function createAuthHeader(): string {
  const { username, password } = xmppConfig.prosody;
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Send an HTTP request to the Prosody mod_rest API and return the parsed response.
 *
 * @param endpoint - The API path to append to the configured Prosody `restUrl` (for example `/accounts`).
 * @param options - Fetch options (method, headers, body, etc.). Provided headers are merged with the required `Content-Type: application/xml` and `Authorization` header.
 * @returns The response parsed as JSON when the `Content-Type` includes `application/json`, otherwise the response body text cast to `T`.
 * @throws Error when the response status is not ok; the thrown message is taken from the response JSON `error` or `message` fields when present, otherwise includes HTTP status and statusText.
 */
async function prosodyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { restUrl } = xmppConfig.prosody;
  const url = `${restUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/xml",
      Authorization: createAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Prosody REST API error: ${response.status} ${response.statusText}`;
    try {
      const errorData = (await response.json()) as ProsodyRestError;
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
    }
    throw new Error(errorMessage);
  }

  // mod_rest returns XML or JSON depending on the request
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  // For XML responses, return the text
  const text = await response.text();
  return text as unknown as T;
}

/**
 * Create an XMPP account in Prosody.
 *
 * Does not set a password; authentication is handled via OAuth.
 *
 * @param username - XMPP localpart (username)
 * @returns The Prosody REST API response for the account creation request
 * @throws Error with message `XMPP account already exists: <jid>` if the account already exists; rethrows other errors
 */
export async function createProsodyAccount(
  username: string
): Promise<ProsodyRestAccountResponse> {
  const jid = formatJid(username, xmppConfig.domain);

  // mod_rest expects XMPP stanzas in XML format
  // Create account stanza: <iq type="set" to="prosody" id="create">
  //   <query xmlns="jabber:iq:register">
  //     <username>username</username>
  //   </query>
  // </iq>
  const stanza = `<?xml version="1.0"?>
<iq type="set" to="${xmppConfig.domain}" id="create_${Date.now()}">
  <query xmlns="jabber:iq:register">
    <username>${username}</username>
  </query>
</iq>`;

  try {
    const result = await prosodyRequest<ProsodyRestAccountResponse>(
      "/accounts",
      {
        method: "POST",
        body: stanza,
      }
    );

    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Check if account already exists
      if (
        error.message.includes("exists") ||
        error.message.includes("409") ||
        error.message.includes("conflict")
      ) {
        throw new Error(`XMPP account already exists: ${jid}`);
      }
      throw error;
    }
    throw new Error("Failed to create Prosody account");
  }
}

/**
 * Delete an XMPP account from the Prosody server.
 *
 * If the account does not exist, the function treats the outcome as successful (idempotent).
 *
 * @param username - The XMPP account localpart to delete
 * @returns The Prosody REST API response; returns `{ success: true }` if the account was deleted or did not exist
 */
export async function deleteProsodyAccount(
  username: string
): Promise<ProsodyRestAccountResponse> {
  // Delete account stanza: <iq type="set" to="prosody" id="delete">
  //   <query xmlns="jabber:iq:register">
  //     <remove/>
  //   </query>
  // </iq>
  const stanza = `<?xml version="1.0"?>
<iq type="set" to="${xmppConfig.domain}" id="delete_${Date.now()}">
  <query xmlns="jabber:iq:register">
    <remove/>
  </query>
</iq>`;

  try {
    const result = await prosodyRequest<ProsodyRestAccountResponse>(
      `/accounts/${encodeURIComponent(username)}`,
      {
        method: "DELETE",
        body: stanza,
      }
    );

    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Check if account doesn't exist
      if (
        error.message.includes("not found") ||
        error.message.includes("404")
      ) {
        // Account doesn't exist, but that's okay for deletion
        return { success: true };
      }
      throw error;
    }
    throw new Error("Failed to delete Prosody account");
  }
}

/**
 * Check if XMPP account exists in Prosody
 *
 * @param username - XMPP localpart (username)
 * @returns true if account exists, false otherwise
 */
export async function checkProsodyAccountExists(
  username: string
): Promise<boolean> {
  try {
    await prosodyRequest(`/accounts/${encodeURIComponent(username)}`, {
      method: "GET",
    });
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("not found") || error.message.includes("404"))
    ) {
      return false;
    }
    // Re-throw other errors
    throw error;
  }
}