/**
 * Shared domain types
 */

import type { UserRole } from "@/lib/utils/constants";

/**
 * User DTO (Data Transfer Object)
 * Safe to expose in API responses
 */
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * User with additional admin fields
 */
export interface AdminUserDTO extends UserDTO {
  banned: boolean;
  banReason: string | null;
  banExpires: Date | string | null;
  twoFactorEnabled: boolean | null;
}

/**
 * Session DTO
 */
export interface SessionDTO {
  id: string;
  userId: string;
  expiresAt: Date | string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
}

/**
 * API Key DTO (excludes sensitive key data)
 */
export interface ApiKeyDTO {
  id: string;
  userId: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  enabled: boolean;
  rateLimitEnabled: boolean;
  rateLimitTimeWindow: number | null;
  rateLimitMax: number | null;
  requestCount: number;
  remaining: number | null;
  lastRequest: Date | string | null;
  expiresAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  permissions: string | null;
  metadata: string | null;
}

/**
 * API Key with user information
 */
export interface ApiKeyWithUserDTO extends ApiKeyDTO {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * OAuth Client DTO
 */
export interface OAuthClientDTO {
  id: string;
  clientId: string;
  name: string;
  redirectUris: string[];
  disabled: boolean;
  createdAt: Date | string;
}

/**
 * Integration Account DTO
 */
export interface IntegrationAccountDTO {
  id: string;
  userId: string;
  integrationType: string;
  status: "active" | "suspended" | "deleted";
  createdAt: Date | string;
  updatedAt: Date | string;
  metadata: Record<string, unknown> | null;
}

/**
 * Integration Info DTO (public integration information)
 */
export interface IntegrationInfoDTO {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string | null;
}

/**
 * Admin Statistics DTO
 */
export interface AdminStatsDTO {
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

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Pagination response
 */
export interface PaginationResponse {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Filter parameters for list endpoints
 */
export interface FilterParams {
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort parameters
 */
export interface SortParams {
  orderBy?: string;
  order?: SortOrder;
}
