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

/**
 * Common API error codes
 */
export const API_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type APIErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

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
