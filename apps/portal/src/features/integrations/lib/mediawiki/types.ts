// ============================================================================
// MediaWiki Types
// ============================================================================
// TypeScript types for MediaWiki account management and MediaWiki Action API
// Types are inferred from Zod schemas for single source of truth

import type { MediaWikiAccount } from "@portal/schemas/integrations/mediawiki";

export type {
  CreateMediaWikiAccountRequest,
  MediaWikiAccount,
  MediaWikiAccountStatus,
  UpdateMediaWikiAccountRequest,
  UpdateMediaWikiAccountStatus,
} from "@portal/schemas/integrations/mediawiki";

/**
 * Result of creating a MediaWiki account. Includes one-time password.
 * Password is never stored; only returned once on create.
 */
export interface CreateMediaWikiAccountResult {
  account: MediaWikiAccount;
  temporaryPassword: string;
}

// ============================================================================
// Domain Types
// ============================================================================

/**
 * Parsed user info from the MediaWiki API (list=users).
 */
export interface UserInfo {
  blockExpiry?: string;
  editCount: number;
  groups: string[];
  name: string;
  registration: string; // ISO timestamp
  userId: number;
}

/**
 * Parsed user contribution entry from the MediaWiki API (list=usercontribs).
 */
export interface UserContrib {
  comment: string;
  sizeDiff: number;
  timestamp: string;
  title: string;
}

// ============================================================================
// Raw MediaWiki API Response Types
// ============================================================================
// These interfaces mirror the JSON structures returned by the MediaWiki
// Action API. They are intentionally loose (optional fields) because the
// API may omit keys depending on the result or error state.

/** Raw response from action=login */
export interface RawLoginResponse {
  login: {
    result: "Success" | "NeedToken" | "Failed" | "Aborted" | string;
    lguserid?: number;
    lgusername?: string;
    lgtoken?: string;
    reason?: string;
  };
}

/** Raw response from action=query&meta=tokens */
export interface RawTokenResponse {
  query: {
    tokens: Record<string, string>;
  };
}

/** Raw response from action=createaccount */
export interface RawCreateAccountResponse {
  createaccount: {
    status: "PASS" | "FAIL" | "UI" | "REDIRECT" | string;
    username?: string;
    userid?: number;
    message?: string;
    messagecode?: string;
  };
}

/** Raw response from action=query&list=users */
export interface RawUserInfoResponse {
  query: {
    users: Array<{
      userid?: number;
      name: string;
      editcount?: number;
      registration?: string;
      groups?: string[];
      blockexpiry?: string;
      missing?: boolean;
    }>;
  };
}

/** Raw response from action=query&list=usercontribs */
export interface RawUserContribsResponse {
  query: {
    usercontribs: Array<{
      title: string;
      timestamp: string;
      comment?: string;
      sizediff?: number;
    }>;
  };
}

/** Raw response from action=block */
export interface RawBlockResponse {
  block: {
    user: string;
    userID?: number;
    expiry?: string;
    id?: number;
    reason?: string;
  };
  error?: {
    code: string;
    info: string;
  };
}

/** Raw response from action=resetpassword */
export interface RawResetPasswordResponse {
  error?: {
    code: string;
    info: string;
  };
  resetpassword: {
    status: "success" | string;
  };
}
