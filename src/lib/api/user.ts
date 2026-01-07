// ============================================================================
// User API Client Functions
// ============================================================================
// Client-side functions for calling user-facing API endpoints

import type { UpdateUserInput, User } from "./types";

/**
 * Fetch current user's profile
 */
export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch("/api/user/me");

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch current user: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.user;
}

/**
 * Update current user's profile
 */
export async function updateCurrentUser(
  data: Pick<UpdateUserInput, "name">
): Promise<User> {
  const response = await fetch("/api/user/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to update profile: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result.user;
}

/**
 * Fetch current user's sessions
 */
export async function fetchMySessions(filters?: {
  active?: boolean;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.active !== undefined) {
    params.append("active", String(filters.active));
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const url = `/api/user/sessions${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch sessions: ${response.statusText}`
    );
  }

  return response.json();
}
