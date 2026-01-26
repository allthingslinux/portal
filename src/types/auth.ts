/**
 * Authentication and authorization types
 */

import type { auth } from "@/auth";

/**
 * Session data returned from verifySession
 */
export interface SessionData {
  isAuth: true;
  userId: string;
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  role?: string;
}

/**
 * Authentication result from API auth guards
 */
export interface AuthResult {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  userId: string;
}

/**
 * User permissions interface
 * Extend this based on your permission system
 */
export interface UserPermissions {
  canViewAdmin?: boolean;
  canViewStaff?: boolean;
  canViewAnalytics?: boolean;
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
