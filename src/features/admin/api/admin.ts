// ============================================================================
// Admin API Client Functions
// ============================================================================
// Client-side functions for calling admin API endpoints

import type {
  AdminStats,
  AdminUserDetailResponse,
  ApiKey,
  ApiKeyListResponse,
  IrcAccountListResponse,
  OAuthClient,
  OAuthClientListResponse,
  Session,
  SessionListFilters,
  SessionListResponse,
  UpdateUserInput,
  User,
  UserListFilters,
  UserListResponse,
} from "@/shared/api/types";

/**
 * Fetch list of users with filters
 */
export async function fetchUsers(
  filters?: UserListFilters
): Promise<UserListResponse> {
  const params = new URLSearchParams();
  if (filters?.role) {
    params.append("role", filters.role);
  }
  if (filters?.banned !== undefined) {
    params.append("banned", String(filters.banned));
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const url = `/api/admin/users${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch users: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch a single user by ID including integration accounts (IRC, XMPP)
 */
export async function fetchUserById(
  userId: string
): Promise<AdminUserDetailResponse> {
  const response = await fetch(`/api/admin/users/${userId}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch user: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Update a user
 */
export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<User> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to update user: ${response.statusText}`
    );
  }

  const result = await response.json();
  return result.user as User;
}

/**
 * Fetch list of IRC accounts (admin-only) with optional status filter and pagination
 */
export async function fetchIrcAccounts(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<IrcAccountListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.append("status", filters.status);
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const url = `/api/admin/irc-accounts${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch IRC accounts: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to delete user: ${response.statusText}`
    );
  }
}

/**
 * Fetch list of sessions with filters
 */
export async function fetchSessions(
  filters?: SessionListFilters
): Promise<SessionListResponse> {
  const params = new URLSearchParams();
  if (filters?.userId) {
    params.append("userId", filters.userId);
  }
  if (filters?.active !== undefined) {
    params.append("active", String(filters.active));
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const url = `/api/admin/sessions${params.toString() ? `?${params}` : ""}`;
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

/**
 * Fetch a single session by ID (admin-only)
 */
export async function fetchSessionById(sessionId: string): Promise<Session> {
  const response = await fetch(`/api/admin/sessions/${sessionId}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch session: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.session;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  const response = await fetch(`/api/admin/sessions/${sessionId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to delete session: ${response.statusText}`
    );
  }
}

/**
 * Fetch admin statistics
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch("/api/admin/stats");

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch stats: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch list of API keys (admin-only, all users)
 */
export async function fetchApiKeys(filters?: {
  userId?: string;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ApiKeyListResponse> {
  const params = new URLSearchParams();
  if (filters?.userId) {
    params.append("userId", filters.userId);
  }
  if (filters?.enabled !== undefined) {
    params.append("enabled", String(filters.enabled));
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const url = `/api/admin/api-keys${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch API keys: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch a single API key by ID (admin-only)
 */
export async function fetchApiKeyById(keyId: string): Promise<ApiKey> {
  const response = await fetch(`/api/admin/api-keys/${keyId}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch API key: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.apiKey;
}

/**
 * Delete an API key (admin-only)
 */
export async function deleteApiKey(keyId: string): Promise<void> {
  const response = await fetch(`/api/admin/api-keys/${keyId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to delete API key: ${response.statusText}`
    );
  }
}

/**
 * Fetch list of OAuth clients (admin-only, all users)
 */
export async function fetchOAuthClients(filters?: {
  userId?: string;
  disabled?: boolean;
  limit?: number;
  offset?: number;
}): Promise<OAuthClientListResponse> {
  const params = new URLSearchParams();
  if (filters?.userId) {
    params.append("userId", filters.userId);
  }
  if (filters?.disabled !== undefined) {
    params.append("disabled", String(filters.disabled));
  }
  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }
  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const url = `/api/admin/oauth-clients${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch OAuth clients: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch a single OAuth client by ID (admin-only)
 */
export async function fetchOAuthClientById(
  clientId: string
): Promise<OAuthClient> {
  const response = await fetch(`/api/admin/oauth-clients/${clientId}`);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch OAuth client: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.client;
}

/**
 * Delete an OAuth client (admin-only)
 */
export async function deleteOAuthClient(clientId: string): Promise<void> {
  const response = await fetch(`/api/admin/oauth-clients/${clientId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to delete OAuth client: ${response.statusText}`
    );
  }
}
