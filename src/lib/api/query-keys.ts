// ============================================================================
// Query Keys Factory
// ============================================================================
// Centralized query key factory for type-safe query key management.
// Follows TanStack Query best practices for hierarchical query keys.

import type {
  OAuthClientListFilters,
  SessionListFilters,
  UserListFilters,
} from "./types";

export const queryKeys = {
  // User queries
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: UserListFilters) =>
      [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
    stats: () => [...queryKeys.users.all, "stats"] as const,
  },

  // Session queries
  sessions: {
    all: ["sessions"] as const,
    lists: () => [...queryKeys.sessions.all, "list"] as const,
    list: (filters?: SessionListFilters) =>
      [...queryKeys.sessions.lists(), { filters }] as const,
    details: () => [...queryKeys.sessions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
    current: () => [...queryKeys.sessions.all, "current"] as const,
    user: (userId: string) =>
      [...queryKeys.sessions.all, "user", userId] as const,
  },

  // API Key queries
  apiKeys: {
    all: ["apiKeys"] as const,
    lists: () => [...queryKeys.apiKeys.all, "list"] as const,
    list: (userId?: string) =>
      [...queryKeys.apiKeys.lists(), { userId }] as const,
    details: () => [...queryKeys.apiKeys.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.apiKeys.details(), id] as const,
    user: (userId: string) =>
      [...queryKeys.apiKeys.all, "user", userId] as const,
  },

  // OAuth Client queries
  oauthClients: {
    all: ["oauthClients"] as const,
    lists: () => [...queryKeys.oauthClients.all, "list"] as const,
    list: (filters?: OAuthClientListFilters) =>
      [...queryKeys.oauthClients.lists(), { filters }] as const,
    details: () => [...queryKeys.oauthClients.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.oauthClients.details(), id] as const,
    user: (userId: string) =>
      [...queryKeys.oauthClients.all, "user", userId] as const,
  },

  // Admin queries
  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
  },
} as const;
