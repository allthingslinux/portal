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

/**
 * Error thrown by Prosody REST API requests, preserving the HTTP status code.
 */
export class ProsodyApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ProsodyApiError";
    this.status = status;
  }
}

// Prosody HTML error page parsing regexes (top-level for lint compliance)
const PROSODY_HTML_EXTRA_RE = /<p class="extra">([^<]+)<\/p>/;
const HTML_STRIP_RE = /<[^>]+>/g;

// ============================================================================
// Prosody REST API Client
// ============================================================================
// Client for interacting with Prosody's mod_http_admin_api module
// Uses Bearer token authentication via mod_tokenauth (PROSODY_REST_TOKEN)
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
 * Parse an error message from a Prosody error response body.
 * Tries JSON first, then falls back to HTML parsing.
 */
function parseProsodyErrorBody(text: string, fallback: string): string {
  try {
    const errorData = JSON.parse(text) as ProsodyRestError;
    return errorData.error || errorData.message || errorData.text || fallback;
  } catch {
    // Not JSON — Prosody often returns HTML error pages.
    // Extract the meaningful part from the HTML (e.g. "User not found").
  }
  if (!text) {
    return fallback;
  }
  const extraMatch = text.match(PROSODY_HTML_EXTRA_RE);
  if (extraMatch?.[1]) {
    return extraMatch[1];
  }
  const stripped = text.replace(HTML_STRIP_RE, " ").trim();
  const firstLine = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)[0];
  if (firstLine && firstLine.length < 200) {
    return firstLine;
  }
  return fallback;
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
    const defaultMsg = `Prosody REST API error: ${response.status} ${response.statusText}`;
    let errorMessage = defaultMsg;
    try {
      const text = await response.text();
      errorMessage = parseProsodyErrorBody(text, defaultMsg);
    } catch {
      // If we can't read the body at all, use the default message
    }
    throw new ProsodyApiError(response.status, errorMessage);
  }

  // mod_http_admin_api returns JSON
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  // For non-JSON responses (e.g. 204 No Content), return empty object
  const text = await response.text();
  if (!text?.trim()) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // Prosody returned a 2xx with non-JSON body (e.g. plain text confirmation).
    // Treat as empty success rather than crashing.
    return {} as T;
  }
}

/**
 * Create or update XMPP account in Prosody via mod_http_admin_api
 *
 * Uses PUT /admin_api/users/{username} with JSON body {"password": "..."}
 * If no password is provided, a random one is generated.
 *
 * @param username - XMPP localpart (username)
 * @param userPassword - Optional user-chosen password. If omitted, a random one is generated.
 * @returns Object with the API result and the password that was set
 */
export async function createProsodyAccount(
  username: string,
  userPassword?: string
): Promise<ProsodyRestAccountResponse & { passwordUsed: string }> {
  validateXmppConfig();
  const jid = formatJid(username, xmppConfig.domain);

  // Use user-provided password or generate a random one.
  const password = userPassword ?? randomBytes(32).toString("hex");

  try {
    const result = await prosodyRequest<ProsodyRestAccountResponse>(
      `/admin_api/users/${encodeURIComponent(username)}`,
      {
        method: "PUT",
        body: JSON.stringify({ password }),
      }
    );

    return { ...result, passwordUsed: password };
  } catch (error) {
    // Note: PUT /admin_api/users/{username} is idempotent (creates or updates),
    // so 409 is unlikely in practice. Kept as defense-in-depth.
    if (error instanceof ProsodyApiError && error.status === 409) {
      throw new ProsodyApiError(409, `XMPP account already exists: ${jid}`);
    }
    if (error instanceof Error) {
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
    if (
      error instanceof ProsodyApiError &&
      (error.status === 404 ||
        (error.status === 500 &&
          error.message.toLowerCase().includes("not found")))
    ) {
      throw new ProsodyAccountNotFoundError();
    }
    if (error instanceof Error) {
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
    if (error instanceof ProsodyApiError) {
      // Prosody's mod_http_admin_api returns 404 OR 500 "User not found"
      // for non-existent users (the 500 is a known module quirk).
      if (error.status === 404) {
        return false;
      }
      if (
        error.status === 500 &&
        error.message.toLowerCase().includes("not found")
      ) {
        return false;
      }
    }
    // Re-throw other errors (auth failures, network issues, etc.)
    throw error;
  }
}

/**
 * Reset the password for an existing XMPP account in Prosody.
 *
 * Uses PUT /admin_api/users/{username} — same endpoint as create (idempotent).
 *
 * @param username - XMPP localpart
 * @param newPassword - The new password to set
 */
export async function resetProsodyPassword(
  username: string,
  newPassword: string
): Promise<void> {
  validateXmppConfig();
  const password = newPassword;
  try {
    await prosodyRequest(`/admin_api/users/${encodeURIComponent(username)}`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    });
  } catch (error) {
    if (
      error instanceof ProsodyApiError &&
      (error.status === 404 ||
        (error.status === 500 &&
          error.message.toLowerCase().includes("not found")))
    ) {
      throw new ProsodyAccountNotFoundError();
    }
    throw error;
  }
}

// ============================================================================
// XMPP Server Stats
// ============================================================================

export interface XmppServerStats {
  /** Users currently connected (from mod_http_user_count, -1 if unavailable) */
  onlineUsers: number;
  /** Total registered accounts */
  registeredUsers: number;
}

/**
 * Fetch XMPP server stats.
 *
 * - Registered users: GET /admin_api/users (counts array length, Bearer auth)
 * - Online users: GET /user_count/users (live session count, IP-based auth via mod_http_user_count)
 */
export async function getXmppStats(): Promise<XmppServerStats> {
  validateXmppConfig();
  const { restUrl, token } = xmppConfig.prosody;

  // Fetch registered user count from admin API
  const usersResponse = await fetch(`${restUrl}/admin_api/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let registeredUsers = 0;
  if (usersResponse.ok) {
    const users = (await usersResponse.json()) as unknown[];
    registeredUsers = users.length;
  }

  // Fetch live online user count from mod_http_user_count (IP-based auth, no Bearer)
  let onlineUsers = -1;
  try {
    const onlineResponse = await fetch(`${restUrl}/user_count/users`, {
      signal: AbortSignal.timeout(5000),
    });
    if (onlineResponse.ok) {
      const text = await onlineResponse.text();
      const parsed = Number.parseInt(text.trim(), 10);
      if (!Number.isNaN(parsed)) {
        onlineUsers = parsed;
      }
    }
  } catch {
    // mod_http_user_count unavailable — onlineUsers stays -1
  }

  return { registeredUsers, onlineUsers };
}
