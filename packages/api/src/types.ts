// ============================================================================
// API Types
// ============================================================================
// Type definitions for API requests and responses
// Note: Filter, input, and response types are now in @/shared/types/api
// This file contains Drizzle-inferred database entity types

import type { apikey } from "@portal/db/schema/api-keys";
import type { session, user } from "@portal/db/schema/auth";
import type { oauthClient } from "@portal/db/schema/oauth";

// Re-export filter, input, and response types from centralized location
export type {
  AdminIrcAccount,
  AdminMailcowAccount,
  AdminStats,
  AdminUserDetailResponse,
  AdminUserRow,
  AdminXmppAccount,
  ApiKeyListFilters,
  ApiKeyListResponse,
  CreateApiKeyInput,
  IrcAccountListResponse,
  IrcAccountWithUser,
  MailcowAccountListResponse,
  MailcowAccountWithUser,
  MediawikiAccountListResponse,
  MediawikiAccountWithUser,
  OAuthClientListFilters,
  OAuthClientListResponse,
  SessionListFilters,
  SessionListResponse,
  UpdateApiKeyInput,
  UpdateUserInput,
  UserListFilters,
  UserListResponse,
  UserListWithIntegrationsResponse,
  UserWithIntegrations,
  XmppAccountListResponse,
  XmppAccountWithUser,
} from "@portal/types/api";

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
