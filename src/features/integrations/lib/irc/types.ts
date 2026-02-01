// ============================================================================
// IRC Types
// ============================================================================
// Shared types for IRC account management and Atheme JSON-RPC
// Types are inferred from Zod schemas for single source of truth

import type { IrcAccount } from "@/shared/schemas/integrations/irc";

export type {
  CreateIrcAccountRequest,
  IrcAccount,
  IrcAccountStatus,
  UpdateIrcAccountRequest,
  UpdateIrcAccountStatus,
} from "@/shared/schemas/integrations/irc";

/**
 * Result of creating an IRC account. Includes one-time password for NickServ.
 * Password is never stored; only returned once on create.
 */
export interface CreateIrcAccountResult {
  account: IrcAccount;
  temporaryPassword: string;
}

/**
 * Atheme JSON-RPC fault codes (from modules/nickserv/register.c and transport/jsonrpc)
 * 1 needmoreparams, 2 badparams, 5 authfail, 6 noprivs (frozen), 8 alreadyexists, 9 toomany, 10 emailfail, 15 badauthcookie, 16 internalerror
 */
export type AthemeFaultCode = 1 | 2 | 5 | 6 | 8 | 9 | 10 | 15 | 16;

/**
 * More flexible fault code type for runtime safety
 */
export type AnyAthemeFaultCode = AthemeFaultCode | number;

/**
 * Atheme JSON-RPC error response
 */
export interface AthemeFault {
  code: AnyAthemeFaultCode;
  message: string;
}
