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
 * Fetch current user's XMPP account
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
 * Fetch a specific XMPP account by ID
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
 * Create a new XMPP account for the current user
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
 * Update an XMPP account
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
 * Delete an XMPP account
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
