/**
 * API response types and error types
 */

/**
 * Standard API success response
 */
export interface APIResponse<T = unknown> {
  data?: T;
  ok: true;
}

/**
 * Standard API error response
 */
export interface APIErrorResponse {
  error: string;
  ok: false;
}

/**
 * API response union type
 */
export type APIResult<T = unknown> = APIResponse<T> | APIErrorResponse;

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  hasMore: boolean;
  limit: number;
  offset: number;
  total: number;
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
  code?: string;
  message: string;
  status: number;
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
 * API error code string literal union.
 *
 * Defined inline so this package has zero internal dependencies.
 * Must stay in sync with `API_ERROR_CODES` in `@portal/utils/constants`.
 */
export type APIErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "RATE_LIMIT_EXCEEDED";

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
  banned?: boolean;
  limit?: number;
  offset?: number;
  role?: string;
  search?: string;
}

/**
 * Filter parameters for session list endpoints
 */
export interface SessionListFilters {
  active?: boolean;
  limit?: number;
  offset?: number;
  userId?: string;
}

/**
 * Filter parameters for API key list endpoints
 */
export interface ApiKeyListFilters {
  enabled?: boolean;
  limit?: number;
  offset?: number;
  userId?: string;
}

/**
 * Filter parameters for OAuth client list endpoints
 */
export interface OAuthClientListFilters {
  disabled?: boolean;
  limit?: number;
  offset?: number;
  userId?: string;
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for updating a user
 */
export interface UpdateUserInput {
  banExpires?: string | null;
  banned?: boolean;
  banReason?: string | null;
  email?: string;
  name?: string;
  role?: string;
}

/**
 * Input for creating an API key
 */
export interface CreateApiKeyInput {
  expiresAt?: string;
  metadata?: string;
  name?: string;
  permissions?: string;
  prefix?: string;
}

/**
 * Input for updating an API key
 */
export interface UpdateApiKeyInput {
  enabled?: boolean;
  name?: string;
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
  hasMore: boolean;
  limit: number;
  offset: number;
  total: number;
}

/**
 * User list response
 * Note: User type is defined in src/lib/api/types.ts as it uses Drizzle inference
 */
export interface UserListResponse<TUser = unknown> {
  pagination: ListPaginationMeta;
  users: TUser[];
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
 * IRC account shape as returned by admin user detail and irc-accounts list APIs.
 * Dates are ISO-8601 strings (JSON wire format).
 */
export interface AdminIrcAccount {
  createdAt: string;
  id: string;
  metadata?: Record<string, unknown> | null;
  nick: string;
  port: number;
  server: string;
  status: string;
  updatedAt: string;
  userId: string;
}

/**
 * XMPP account shape as returned by admin user detail API.
 * Dates are ISO-8601 strings (JSON wire format).
 */
export interface AdminXmppAccount {
  createdAt: string;
  id: string;
  jid: string;
  metadata?: Record<string, unknown> | null;
  status: string;
  updatedAt: string;
  userId: string;
  username: string;
}

/**
 * Mailcow account shape as returned by admin user detail API.
 * Dates are ISO-8601 strings (JSON wire format).
 */
export interface AdminMailcowAccount {
  createdAt: string;
  domain: string;
  email: string;
  id: string;
  localPart: string;
  metadata?: Record<string, unknown> | null;
  status: string;
  updatedAt: string;
  userId: string;
}

/**
 * User row shape in admin user detail response.
 * Dates are ISO-8601 strings (JSON wire format).
 */
export interface AdminUserRow {
  banned: boolean | null;
  createdAt: string;
  email: string;
  id: string;
  name: string | null;
  role: string;
  updatedAt: string;
}

/**
 * Admin user detail response (GET /api/admin/users/[id]) including integration accounts
 */
export interface AdminUserDetailResponse {
  ircAccount: AdminIrcAccount | null;
  mailcowAccount: AdminMailcowAccount | null;
  user: AdminUserRow;
  xmppAccount: AdminXmppAccount | null;
}

/**
 * IRC account with optional user info for admin list
 */
export interface IrcAccountWithUser extends AdminIrcAccount {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Admin IRC accounts list response (GET /api/admin/irc-accounts)
 */
export interface IrcAccountListResponse {
  ircAccounts: IrcAccountWithUser[];
  pagination: ListPaginationMeta;
}

/**
 * XMPP account with optional user info for admin list
 */
export interface XmppAccountWithUser extends AdminXmppAccount {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Admin XMPP accounts list response (GET /api/admin/xmpp-accounts)
 */
export interface XmppAccountListResponse {
  pagination: ListPaginationMeta;
  xmppAccounts: XmppAccountWithUser[];
}

/**
 * Mailcow account with optional user info for admin list
 */
export interface MailcowAccountWithUser extends AdminMailcowAccount {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Admin Mailcow accounts list response (GET /api/admin/mailcow-accounts)
 */
export interface MailcowAccountListResponse {
  mailcowAccounts: MailcowAccountWithUser[];
  pagination: ListPaginationMeta;
}

/**
 * MediaWiki account shape as returned by admin APIs.
 * Dates are ISO-8601 strings (JSON wire format).
 */
export interface AdminMediawikiAccount {
  createdAt: string;
  id: string;
  metadata?: Record<string, unknown> | null;
  status: string;
  updatedAt: string;
  userId: string;
  wikiUserId: number | null;
  wikiUsername: string;
}

/**
 * MediaWiki account with optional user info for admin list
 */
export interface MediawikiAccountWithUser extends AdminMediawikiAccount {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * MediaWiki account shape as returned by admin APIs.
 * Dates are ISO-8601 strings (JSON wire format).
 */
export interface AdminMediawikiAccount {
  createdAt: string;
  id: string;
  metadata?: Record<string, unknown> | null;
  status: string;
  updatedAt: string;
  userId: string;
  wikiUserId: number | null;
  wikiUsername: string;
}

/**
 * MediaWiki account with optional user info for admin list
 */
export interface MediawikiAccountWithUser extends AdminMediawikiAccount {
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Admin MediaWiki accounts list response (GET /api/admin/mediawiki-accounts)
 */
export interface MediawikiAccountListResponse {
  mediawikiAccounts: MediawikiAccountWithUser[];
  pagination: ListPaginationMeta;
}
