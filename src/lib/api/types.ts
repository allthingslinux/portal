// ============================================================================
// API Types
// ============================================================================
// Type definitions for API requests and responses

import type { apikey } from "@/lib/db/schema/api-keys";
import type { session, user } from "@/lib/db/schema/auth";
import type { oauthClient } from "@/lib/db/schema/oauth";

// Filter types
export interface UserListFilters {
  role?: string;
  banned?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SessionListFilters {
  userId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ApiKeyListFilters {
  userId?: string;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

export interface OAuthClientListFilters {
  userId?: string;
  disabled?: boolean;
  limit?: number;
  offset?: number;
}

// User types
export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
}

// Session types
export type Session = typeof session.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};

export interface SessionListResponse {
  sessions: Session[];
}

// API Key types
export type ApiKey = typeof apikey.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};
export type ApiKeyInsert = typeof apikey.$inferInsert;

export interface ApiKeyListResponse {
  apiKeys: ApiKey[];
}

export interface CreateApiKeyInput {
  name?: string;
  prefix?: string;
  expiresAt?: string;
  permissions?: string;
  metadata?: string;
}

export interface UpdateApiKeyInput {
  name?: string;
  enabled?: boolean;
  rateLimitEnabled?: boolean;
  rateLimitMax?: number;
  rateLimitTimeWindow?: number;
}

// OAuth Client types
export type OAuthClient = typeof oauthClient.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};
export type OAuthClientInsert = typeof oauthClient.$inferInsert;

export interface OAuthClientListResponse {
  clients: OAuthClient[];
}

// Admin Stats types
export interface AdminStats {
  users: {
    total: number;
    admins: number;
    staff: number;
    banned: number;
    regular: number;
  };
  sessions: {
    total: number;
    active: number;
  };
  apiKeys: {
    total: number;
    enabled: number;
  };
  oauthClients: {
    total: number;
    disabled: number;
  };
}
