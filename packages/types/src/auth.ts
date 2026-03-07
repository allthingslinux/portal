/**
 * Authentication and authorization types
 *
 * Session types use a generic parameter so this package stays independent
 * of the app's auth module. The app narrows the generic when it creates
 * concrete instances (e.g. via `auth.api.getSession`).
 */

/**
 * Session data returned from verifySession.
 *
 * `TSession` defaults to `Record<string, unknown>` so consumers that don't
 * need the concrete BetterAuth session shape can still use the type.
 * Inside the app, `TSession` is narrowed to the real session type.
 */
export interface SessionData<TSession = Record<string, unknown>> {
  isAuth: true;
  role?: string;
  session: TSession;
  userId: string;
}

/**
 * Authentication result from API auth guards.
 *
 * Same generic pattern as `SessionData`.
 */
export interface AuthResult<
  TSession = {
    user: { id: string; email: string; [key: string]: unknown };
    [key: string]: unknown;
  },
> {
  session: TSession;
  userId: string;
}

/**
 * User permissions interface
 * Extend this based on your permission system
 */
export interface UserPermissions {
  canViewAdmin?: boolean;
  canViewAnalytics?: boolean;
  canViewStaff?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Permission type for route and feature access control
 */
export type Permission =
  | "canViewAdmin"
  | "canViewStaff"
  | "canViewAnalytics"
  | string;
