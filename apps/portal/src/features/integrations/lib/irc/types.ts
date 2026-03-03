// ============================================================================
// IRC Types
// ============================================================================
// Shared types for IRC account management and Atheme JSON-RPC
// Types are inferred from Zod schemas for single source of truth

import type { IrcAccount } from "@portal/schemas/integrations/irc";

export type {
  CreateIrcAccountRequest,
  IrcAccount,
  IrcAccountStatus,
  UpdateIrcAccountRequest,
  UpdateIrcAccountStatus,
} from "@portal/schemas/integrations/irc";

/**
 * Result of creating an IRC account. Includes one-time password for NickServ.
 * Password is never stored; only returned once on create.
 */
export interface CreateIrcAccountResult {
  account: IrcAccount;
  temporaryPassword: string;
}

/**
 * Atheme JSON-RPC fault codes (from modules/transport/jsonrpc/main.c)
 *
 *  1  fault_needmoreparams   - Not enough parameters
 *  2  fault_badparams        - Parameters invalid
 *  3  fault_nosuch_source    - Source account does not exist
 *  4  fault_nosuch_target    - Target does not exist
 *  5  fault_authfail         - Bad password or authcookie
 *  6  fault_noprivs          - Permission denied (frozen, etc.)
 *  7  fault_nosuch_key       - Requested element does not exist
 *  8  fault_alreadyexists    - Something conflicting already exists
 *  9  fault_toomany          - Too many of something
 * 10  fault_emailfail        - Sending email failed
 * 11  fault_notverified      - Account not verified
 * 12  fault_nochange         - Object already in requested state
 * 13  fault_already_authed   - Already logged in
 * 14  fault_unimplemented    - Function not implemented
 *
 * 15 and 16 are used by the JSONRPC transport layer (not service commands):
 * 15  fault_badauthcookie - Invalid authcookie (logout/command auth)
 * 16  fault_internalerror - Internal error
 */
export type AthemeFaultCode =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

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
