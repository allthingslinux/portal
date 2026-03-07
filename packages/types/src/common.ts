/**
 * Shared domain types
 */

/**
 * User role string literal union.
 *
 * Defined inline so this package has zero internal dependencies.
 * Must stay in sync with `USER_ROLES` in `@portal/utils/constants`.
 */
export type UserRole = "user" | "staff" | "admin";

/**
 * User DTO (Data Transfer Object)
 * Safe to expose in API responses
 */
export interface UserDTO {
  createdAt: Date | string;
  email: string;
  emailVerified: boolean;
  id: string;
  image: string | null;
  name: string;
  role: UserRole;
  updatedAt?: Date | string;
}

/**
 * User with additional admin fields
 */
export interface AdminUserDTO extends UserDTO {
  banExpires: Date | string | null;
  banned: boolean;
  banReason: string | null;
  twoFactorEnabled: boolean | null;
}

/**
 * Session DTO
 */
export interface SessionDTO {
  createdAt: Date | string;
  expiresAt: Date | string;
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
}

/**
 * API Key DTO (excludes sensitive key data)
 */
export interface ApiKeyDTO {
  configId: string;
  createdAt: Date | string;
  enabled: boolean;
  expiresAt: Date | string | null;
  id: string;
  lastRequest: Date | string | null;
  metadata: string | null;
  name: string | null;
  permissions: string | null;
  prefix: string | null;
  rateLimitEnabled: boolean;
  rateLimitMax: number | null;
  rateLimitTimeWindow: number | null;
  referenceId: string;
  remaining: number | null;
  requestCount: number;
  start: string | null;
  updatedAt: Date | string;
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
  clientId: string;
  createdAt: Date | string;
  disabled: boolean;
  id: string;
  name: string;
  redirectUris: string[];
}

/**
 * Integration Account DTO
 */
export interface IntegrationAccountDTO {
  createdAt: Date | string;
  id: string;
  integrationType: string;
  metadata: Record<string, unknown> | null;
  status: "active" | "suspended" | "deleted";
  updatedAt: Date | string;
  userId: string;
}

/**
 * Integration Info DTO (public integration information)
 */
export interface IntegrationInfoDTO {
  description: string;
  enabled: boolean;
  icon: string | null;
  id: string;
  name: string;
}

/**
 * Admin Statistics DTO
 */
export interface AdminStatsDTO {
  apiKeys: {
    total: number;
    enabled: number;
  };
  oauthClients: {
    total: number;
    disabled: number;
  };
  sessions: {
    total: number;
    active: number;
  };
  users: {
    total: number;
    admins: number;
    staff: number;
    banned: number;
    regular: number;
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
  hasMore: boolean;
  limit: number;
  offset: number;
  total: number;
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
  order?: SortOrder;
  orderBy?: string;
}
