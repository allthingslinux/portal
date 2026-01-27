// ============================================================================
// API Types
// ============================================================================
// Type definitions for API requests and responses
// Note: Filter, input, and response types are now in @/shared/types/api
// This file contains Drizzle-inferred database entity types

import type { apikey } from "@/db/schema/api-keys";
import type { session, user } from "@/db/schema/auth";
import type { oauthClient } from "@/db/schema/oauth";

// Re-export filter, input, and response types from centralized location
export type {
  AdminStats,
  ApiKeyListFilters,
  ApiKeyListResponse,
  CreateApiKeyInput,
  OAuthClientListFilters,
  OAuthClientListResponse,
  SessionListFilters,
  SessionListResponse,
  UpdateApiKeyInput,
  UpdateUserInput,
  UserListFilters,
  UserListResponse,
} from "@/shared/types/api";

// User types
export type User = typeof user.$inferSelect;
export type UserInsert = typeof user.$inferInsert;

// Database entity types (Drizzle-inferred - keep here due to schema coupling)
// Session types
export type Session = typeof session.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};

// API Key types
export type ApiKey = typeof apikey.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};
export type ApiKeyInsert = typeof apikey.$inferInsert;

// OAuth Client types
export type OAuthClient = typeof oauthClient.$inferSelect & {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
};
export type OAuthClientInsert = typeof oauthClient.$inferInsert;
