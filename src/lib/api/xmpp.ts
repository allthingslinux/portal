// ============================================================================
// XMPP API Client Functions
// ============================================================================
// Client-side functions for calling XMPP account API endpoints

import type {
  CreateXmppAccountRequest,
  UpdateXmppAccountRequest,
  XmppAccount,
} from "@/lib/xmpp/types";

/**
 * Response type from XMPP API endpoints
 */
interface XmppApiResponse<T> {
  ok: boolean;
  error?: string;
  account?: T;
  message?: string;
}

/**
 * Retrieve the current user's XMPP account.
 *
 * @returns The user's `XmppAccount` if one exists, or `null` if the server reports no account (404) or the response contains no account.
 * @throws Error when the HTTP response is not successful (except 404); the error message contains the server-provided error text or the response status text.
 */
export async function fetchXmppAccount(): Promise<XmppAccount | null> {
  const response = await fetch("/api/xmpp/accounts");

  if (!response.ok) {
    if (response.status === 404) {
      return null; // User doesn't have an XMPP account yet
    }
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch XMPP account: ${response.statusText}`
    );
  }

  const data = (await response.json()) as XmppApiResponse<XmppAccount>;
  return data.account ?? null;
}

/**
 * Retrieve the XMPP account with the specified ID.
 *
 * @param id - The ID of the XMPP account to fetch
 * @returns The XMPP account corresponding to `id`
 * @throws When the server responds with a non-OK status or when the response does not include an account
 */
export async function fetchXmppAccountById(id: string): Promise<XmppAccount> {
  const response = await fetch(`/api/xmpp/accounts/${id}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch XMPP account: ${response.statusText}`
    );
  }

  const data = (await response.json()) as XmppApiResponse<XmppAccount>;
  if (!data.account) {
    throw new Error("XMPP account not found");
  }
  return data.account;
}

/**
 * Creates a new XMPP account for the current user.
 *
 * @param data - Payload with the fields required to create the account
 * @returns The created `XmppAccount`
 * @throws Error if the API request fails or the response does not include an account
 */
export async function createXmppAccount(
  data: CreateXmppAccountRequest
): Promise<XmppAccount> {
  const response = await fetch("/api/xmpp/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to create XMPP account: ${response.statusText}`
    );
  }

  const result = (await response.json()) as XmppApiResponse<XmppAccount>;
  if (!result.account) {
    throw new Error("Failed to create XMPP account: No account returned");
  }
  return result.account;
}

/**
 * Update an existing XMPP account by ID.
 *
 * @param id - The ID of the XMPP account to update
 * @param data - Partial account fields to update
 * @returns The updated XMPP account
 * @throws Error if the server responds with an error or if the response does not include the updated account
 */
export async function updateXmppAccount(
  id: string,
  data: UpdateXmppAccountRequest
): Promise<XmppAccount> {
  const response = await fetch(`/api/xmpp/accounts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to update XMPP account: ${response.statusText}`
    );
  }

  const result = (await response.json()) as XmppApiResponse<XmppAccount>;
  if (!result.account) {
    throw new Error("Failed to update XMPP account: No account returned");
  }
  return result.account;
}

/**
 * Delete the XMPP account with the specified ID.
 *
 * @param id - The ID of the XMPP account to delete.
 * @throws Error if the server responds with a non-OK status; the error message will include the server-provided message when available.
 */
export async function deleteXmppAccount(id: string): Promise<void> {
  const response = await fetch(`/api/xmpp/accounts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to delete XMPP account: ${response.statusText}`
    );
  }
}