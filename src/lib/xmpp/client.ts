import "server-only";

import { xmppConfig } from "./config";
import type { ProsodyRestAccountResponse, ProsodyRestError } from "./types";
import { formatJid } from "./utils";

/**
 * Custom error for Prosody account not found
 */
export class ProsodyAccountNotFoundError extends Error {
  constructor(message = "Prosody account not found") {
    super(message);
    this.name = "ProsodyAccountNotFoundError";
  }
}

/**
 * Escape XML special characters for defense-in-depth
 * Username is already validated, but this prevents XML injection if validation fails
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ============================================================================
// Prosody REST API Client
// ============================================================================
// Client for interacting with Prosody's mod_rest API
// Uses HTTP Basic authentication with admin JID and component secret
//
// Documentation: https://modules.prosody.im/mod_rest.html

/**
 * Create Basic Auth header for Prosody REST API
 */
function createAuthHeader(): string {
  const { username, password } = xmppConfig.prosody;
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  return `Basic ${credentials}`;
}

/**
 * Make a request to Prosody REST API
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
 * Create XMPP account in Prosody
 * Note: No password is set - authentication is handled via OAuth
 *
 * @param username - XMPP localpart (username)
 * @returns Success response
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
    <username>${escapeXml(username)}</username>
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
 * Delete XMPP account from Prosody
 *
 * @param username - XMPP localpart (username)
 * @returns Success response
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
        throw new ProsodyAccountNotFoundError();
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
