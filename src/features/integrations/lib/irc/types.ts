// ============================================================================
// IRC Types
// ============================================================================
// Shared types for IRC account management and Atheme JSON-RPC

/**
 * IRC account status (matches irc_account_status enum)
 */
export type IrcAccountStatus = "active" | "suspended" | "deleted";

/**
 * IRC account information (Portal DB + integration id)
 */
export interface IrcAccount {
  id: string;
  userId: string;
  integrationId: "irc";
  nick: string;
  server: string;
  port: number;
  status: IrcAccountStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Create IRC account request. Nick is required (no auto-generate in v1).
 */
export interface CreateIrcAccountRequest extends Record<string, unknown> {
  nick: string;
}

/**
 * Result of creating an IRC account. Includes one-time password for NickServ.
 * Password is never stored; only returned once on create.
 */
export interface CreateIrcAccountResult {
  account: IrcAccount;
  temporaryPassword: string;
}

/**
 * Update IRC account request (status, metadata; nick change deferred in v1)
 */
export interface UpdateIrcAccountRequest extends Record<string, unknown> {
  nick?: string;
  status?: IrcAccountStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Atheme JSON-RPC fault codes (from modules/nickserv/register.c and transport/jsonrpc)
 * 1 needmoreparams, 2 badparams, 5 authfail, 6 noprivs (frozen), 8 alreadyexists, 9 toomany, 10 emailfail, 15 badauthcookie, 16 internalerror
 */
export type AthemeFaultCode = 1 | 2 | 5 | 6 | 8 | 9 | 10 | 15 | 16;

/**
 * Atheme JSON-RPC error response
 */
export interface AthemeFault {
  code: AthemeFaultCode;
  message: string;
}
