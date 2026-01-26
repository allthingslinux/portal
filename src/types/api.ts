/**
 * API response types and error types
 */

/**
 * Standard API success response
 */
export interface APIResponse<T = unknown> {
  ok: true;
  data?: T;
}

/**
 * Standard API error response
 */
export interface APIErrorResponse {
  ok: false;
  error: string;
}

/**
 * API response union type
 */
export type APIResult<T = unknown> = APIResponse<T> | APIErrorResponse;

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * API error with status code
 */
export interface APIErrorInfo {
  message: string;
  status: number;
  code?: string;
}

/**
 * HTTP status codes
 */
export type HTTPStatusCode =
  | 200
  | 201
  | 204
  | 400
  | 401
  | 403
  | 404
  | 409
  | 500
  | 503;

import type { APIErrorCode as APIErrorCodeType } from "@/lib/utils/constants";

/**
 * API error code type
 * Re-exported from constants for convenience
 */
export type APIErrorCode = APIErrorCodeType;

// Re-export constant for backward compatibility
export { API_ERROR_CODES } from "@/lib/utils/constants";

/**
 * Extended error response with code
 */
export interface ExtendedAPIErrorResponse extends APIErrorResponse {
  code?: APIErrorCode;
  details?: Record<string, unknown>;
}

/**
 * Request query parameters for list endpoints
 */
export interface ListQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * Request query parameters for filtered list endpoints
 */
export interface FilteredListQueryParams extends ListQueryParams {
  [key: string]: string | number | undefined;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filter parameters for user list endpoints
 */
export interface UserListFilters {
  role?: string;
  banned?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Filter parameters for session list endpoints
 */
export interface SessionListFilters {
  userId?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Filter parameters for API key list endpoints
 */
export interface ApiKeyListFilters {
  userId?: string;
  enabled?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Filter parameters for OAuth client list endpoints
 */
export interface OAuthClientListFilters {
  userId?: string;
  disabled?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for updating a user
 */
export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
}

/**
 * Input for creating an API key
 */
export interface CreateApiKeyInput {
  name?: string;
  prefix?: string;
  expiresAt?: string;
  permissions?: string;
  metadata?: string;
}

/**
 * Input for updating an API key
 */
export interface UpdateApiKeyInput {
  name?: string;
  enabled?: boolean;
  rateLimitEnabled?: boolean;
  rateLimitMax?: number;
  rateLimitTimeWindow?: number;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Pagination metadata for list responses
 */
export interface ListPaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * User list response
 * Note: User type is defined in src/lib/api/types.ts as it uses Drizzle inference
 */
export interface UserListResponse<TUser = unknown> {
  users: TUser[];
  pagination: ListPaginationMeta;
}

/**
 * Session list response
 * Note: Session type is defined in src/lib/api/types.ts as it uses Drizzle inference
 */
export interface SessionListResponse<TSession = unknown> {
  sessions: TSession[];
}

/**
 * API key list response
 * Note: ApiKey type is defined in src/lib/api/types.ts as it uses Drizzle inference
 */
export interface ApiKeyListResponse<TApiKey = unknown> {
  apiKeys: TApiKey[];
}

/**
 * OAuth client list response
 * Note: OAuthClient type is defined in src/lib/api/types.ts as it uses Drizzle inference
 */
export interface OAuthClientListResponse<TOAuthClient = unknown> {
  clients: TOAuthClient[];
}

/**
 * Admin statistics response
 */
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
