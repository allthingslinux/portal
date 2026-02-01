// ============================================================================
// IRC Types
// ============================================================================
// Shared types for IRC account management and Atheme JSON-RPC
// Types are inferred from Zod schemas for single source of truth

import type { z } from "zod";

import type {
  CreateIrcAccountRequestSchema,
  IrcAccountSchema,
  IrcAccountStatusSchema,
  UpdateIrcAccountRequestSchema,
  UpdateIrcAccountStatusSchema,
} from "@/shared/schemas/integrations/irc";

/**
 * IRC account status (matches irc_account_status enum)
 * Inferred from Zod schema
 */
export type IrcAccountStatus = z.infer<typeof IrcAccountStatusSchema>;

/**
 * IRC account information (Portal DB + integration id)
 * Inferred from Zod schema for type safety
 */
export type IrcAccount = z.infer<typeof IrcAccountSchema>;

/**
 * Create IRC account request. Nick is required (no auto-generate in v1).
 * Inferred from Zod schema for type safety
 */
export type CreateIrcAccountRequest = z.infer<
  typeof CreateIrcAccountRequestSchema
>;

/**
 * Result of creating an IRC account. Includes one-time password for NickServ.
 * Password is never stored; only returned once on create.
 */
export interface CreateIrcAccountResult {
  account: IrcAccount;
  temporaryPassword: string;
}

/**
 * Statuses allowed in an update request
 * Inferred from Zod schema
 */
export type UpdateIrcAccountStatus = z.infer<
  typeof UpdateIrcAccountStatusSchema
>;

/**
 * Update IRC account request (status, metadata; nick change deferred in v1)
 * Inferred from Zod schema for type safety
 */
export type UpdateIrcAccountRequest = z.infer<
  typeof UpdateIrcAccountRequestSchema
>;

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
