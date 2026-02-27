import "server-only";

import { randomBytes } from "node:crypto";

import { validateXmppConfig, xmppConfig } from "./config";
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

// ============================================================================
// Prosody REST API Client
// ============================================================================
// Client for interacting with Prosody's mod_http_admin_api module
// Uses HTTP Basic authentication with PROSODY_REST_USERNAME:PROSODY_REST_PASSWORD
//
// Documentation: https://modules.prosody.im/mod_http_admin_api.html
// Endpoint: PUT {PROSODY_REST_URL}/admin_api/users/{username}
// Body: { "password": "..." }

/**
 * Create Authorization header for Prosody REST API.
 * mod_http_admin_api (Prosody 13+) requires Bearer token auth via mod_tokenauth.
 */
function createAuthHeader(): string {
  const { token } = xmppConfig.prosody;
  if (!token) {
    throw new Error(
      "PROSODY_REST_TOKEN is required for mod_http_admin_api Bearer auth"
    );
  }
  return `Bearer ${token}`;
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
      "Content-Type": "application/json",
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

  // mod_http_admin_api returns JSON
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  // For non-JSON responses (e.g. 204 No Content), return empty object
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/**
 * Create or update XMPP account in Prosody via mod_http_admin_api
 *
 * Uses PUT /admin_api/users/{username} with JSON body {"password": "..."}
 * A random password is generated; the portal does not store it — authentication
 * is handled externally (e.g. OAuth / SASL EXTERNAL).
 *
 * @param username - XMPP localpart (username)
 * @returns Success response
 */
export async function createProsodyAccount(
  username: string
): Promise<ProsodyRestAccountResponse> {
  validateXmppConfig();
  const jid = formatJid(username, xmppConfig.domain);

  // Generate a random password for the Prosody account.
  // The portal does not store this password; XMPP client auth is handled separately.
  const password = randomBytes(32).toString("hex");

  try {
    const result = await prosodyRequest<ProsodyRestAccountResponse>(
      `/admin_api/users/${encodeURIComponent(username)}`,
      {
        method: "PUT",
        body: JSON.stringify({ password }),
      }
    );

    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Check if account already exists (409 Conflict)
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
 * Delete XMPP account from Prosody via mod_http_admin_api
 *
 * Uses DELETE /admin_api/users/{username}
 *
 * @param username - XMPP localpart (username)
 * @returns Success response
 */
export async function deleteProsodyAccount(
  username: string
): Promise<ProsodyRestAccountResponse> {
  validateXmppConfig();

  try {
    const result = await prosodyRequest<ProsodyRestAccountResponse>(
      `/admin_api/users/${encodeURIComponent(username)}`,
      {
        method: "DELETE",
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
        throw new ProsodyAccountNotFoundError();
      }
      throw error;
    }
    throw new Error("Failed to delete Prosody account");
  }
}

/**
 * Check if XMPP account exists in Prosody via mod_http_admin_api
 *
 * Uses GET /admin_api/users/{username}
 *
 * @param username - XMPP localpart (username)
 * @returns true if account exists, false otherwise
 */
export async function checkProsodyAccountExists(
  username: string
): Promise<boolean> {
  validateXmppConfig();
  try {
    await prosodyRequest(`/admin_api/users/${encodeURIComponent(username)}`, {
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

/**
 * Reset the password for an existing XMPP account in Prosody.
 *
 * Uses PUT /admin_api/users/{username} — same endpoint as create (idempotent).
 * A new random password is generated; the portal does not store it.
 *
 * @param username - XMPP localpart
 */
export async function resetProsodyPassword(username: string): Promise<void> {
  validateXmppConfig();
  const password = randomBytes(32).toString("hex");
  await prosodyRequest(`/admin_api/users/${encodeURIComponent(username)}`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}
