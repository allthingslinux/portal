import "server-only";

import { ircConfig } from "../config";
import type { AnyAthemeFaultCode, AthemeFault } from "../types";

/** JSON-RPC 2.0 request — Atheme requires `id` as a string (not number) */
interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: string[];
  id: string;
}

/** JSON-RPC 2.0 success response — result is always a string for atheme.command */
interface JsonRpcSuccess {
  jsonrpc: "2.0";
  result: string;
  id: string;
}

/** JSON-RPC 2.0 success response with object result (atheme.ison) */
interface JsonRpcObjectSuccess<T> {
  jsonrpc: "2.0";
  result: T;
  id: string;
}

/** JSON-RPC 2.0 error response (Atheme fault) */
interface JsonRpcError {
  jsonrpc: "2.0";
  error: { code: number; message: string };
  id: string;
}

/**
 * Thrown when Atheme returns a fault (e.g. nick taken, bad params).
 */
export class AthemeFaultError extends Error {
  readonly code: AnyAthemeFaultCode;
  readonly fault: AthemeFault;

  constructor(fault: AthemeFault) {
    super(fault.message);
    this.name = "AthemeFaultError";
    this.code = fault.code;
    this.fault = fault;
  }
}

async function athemeRpc<T = string>(
  method: string,
  params: string[]
): Promise<T> {
  const url = ircConfig.atheme.jsonrpcUrl;
  if (!url) {
    throw new Error("IRC_ATHEME_JSONRPC_URL is not configured");
  }

  const body: JsonRpcRequest = {
    jsonrpc: "2.0",
    method,
    params,
    id: "1",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const fetchOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    };

    if (ircConfig.atheme.insecureSkipVerify) {
      const { Agent } = await import("undici");
      // @ts-expect-error - 'dispatcher' is supported by native fetch in Node.js (undici)
      fetchOptions.dispatcher = new Agent({
        connect: { rejectUnauthorized: false },
      });
    }

    const response = await fetch(url, fetchOptions);

    const data = (await response.json()) as
      | JsonRpcSuccess
      | JsonRpcObjectSuccess<T>
      | JsonRpcError
      | { error?: { code?: number; message?: string } };

    if (!response.ok) {
      const err = data as JsonRpcError;
      const code = (err.error?.code ?? 16) as AnyAthemeFaultCode;
      const message = err.error?.message ?? "Atheme request failed";
      throw new AthemeFaultError({ code, message });
    }

    if ("error" in data && data.error) {
      const err = data as JsonRpcError;
      const code = (err.error?.code ?? 16) as AnyAthemeFaultCode;
      throw new AthemeFaultError({
        code,
        message: err.error.message ?? "Atheme fault",
      });
    }

    return (data as JsonRpcObjectSuccess<T>).result as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Call atheme.command (unauthenticated — cookie ".", account ".").
 * Atheme's JSONRPC rejects empty-string params, so use "." as placeholder.
 * Params: authcookie, account, sourceip, service, command, ...commandParams
 */
function athemeCommand(params: string[]): Promise<string> {
  return athemeRpc<string>("atheme.command", params);
}

// ============================================================================
// NickServ commands
// ============================================================================

/**
 * Register a nick with NickServ.
 * @throws AthemeFaultError — code 8 = already registered, 2 = bad params, 9 = too many registrations
 */
export async function registerNick(
  nick: string,
  password: string,
  email: string,
  sourceIp = "127.0.0.1"
): Promise<void> {
  await athemeCommand([
    ".",
    ".",
    sourceIp,
    "NickServ",
    "REGISTER",
    nick.trim(),
    password,
    email.trim(),
  ]);
}

/**
 * Drop (permanently delete) a NickServ registration.
 * Requires the account password for confirmation.
 * @throws AthemeFaultError on failure
 */
export async function dropNick(
  nick: string,
  password: string,
  sourceIp = "127.0.0.1"
): Promise<void> {
  await athemeCommand([
    ".",
    ".",
    sourceIp,
    "NickServ",
    "DROP",
    nick.trim(),
    password,
  ]);
}

/**
 * Set a new password for a NickServ account (admin: uses SETPASS).
 * Requires an authenticated admin session — pass cookie + accountname of an oper.
 * For unauthenticated use, prefer dropNick + re-register.
 * @throws AthemeFaultError on failure
 */
export async function setNickPassword(
  adminCookie: string,
  adminAccount: string,
  targetNick: string,
  newPassword: string,
  sourceIp = "127.0.0.1"
): Promise<void> {
  await athemeCommand([
    adminCookie,
    adminAccount,
    sourceIp,
    "NickServ",
    "SETPASS",
    targetNick.trim(),
    newPassword,
  ]);
}

// ============================================================================
// atheme.ison — check if a nick is online
// ============================================================================

export interface AthemeIsonResult {
  online: boolean;
  /** Account name the nick is authed to, or "*" if not authed */
  accountname: string;
}

/**
 * Check if a nick is currently connected to the network.
 * Returns { online, accountname } — no auth required.
 */
export async function isonNick(nick: string): Promise<AthemeIsonResult> {
  const result = await athemeRpc<AthemeIsonResult>("atheme.ison", [
    nick.trim(),
  ]);
  return result;
}

// ============================================================================
// atheme.metadata — read metadata on accounts or channels
// ============================================================================

/**
 * Read a metadata key from an account or channel.
 * entity: account name, UID, or channel name (e.g. "#general")
 * key: metadata key (e.g. "private:freeze:freezer", "private:mark:setter")
 *
 * @throws AthemeFaultError code 3 if entity or key not found
 */
export function getMetadata(entity: string, key: string): Promise<string> {
  return athemeRpc<string>("atheme.metadata", [entity.trim(), key.trim()]);
}

// ============================================================================
// atheme.login / atheme.logout — session management
// ============================================================================

/**
 * Obtain an authcookie for an Atheme account.
 * Returns the authcookie ticket string.
 * @throws AthemeFaultError — code 3 = not registered, 5 = bad password, 6 = frozen
 */
export function athemeLogin(
  accountName: string,
  password: string,
  sourceIp = "127.0.0.1"
): Promise<string> {
  return athemeRpc<string>("atheme.login", [
    accountName.trim(),
    password,
    sourceIp,
  ]);
}

/**
 * Destroy an authcookie session.
 * @throws AthemeFaultError on failure
 */
export async function athemeLogout(
  cookie: string,
  accountName: string
): Promise<void> {
  await athemeRpc<string>("atheme.logout", [cookie, accountName.trim()]);
}

// ============================================================================
// Oper-level NickServ commands
// ============================================================================

/**
 * Force-drop a NickServ registration using oper credentials (no password needed).
 * Requires IRC_ATHEME_OPER_ACCOUNT + IRC_ATHEME_OPER_PASSWORD to be configured.
 *
 * Flow: athemeLogin(oper) → NickServ FDROP <nick> → athemeLogout
 *
 * @throws Error if oper credentials are not configured
 * @throws AthemeFaultError on Atheme failure
 */
export async function fdropNick(
  nick: string,
  sourceIp = "127.0.0.1"
): Promise<void> {
  const { operAccount, operPassword } = ircConfig.atheme;
  if (!(operAccount && operPassword)) {
    throw new Error(
      "IRC_ATHEME_OPER_ACCOUNT and IRC_ATHEME_OPER_PASSWORD must be configured for FDROP"
    );
  }

  const cookie = await athemeLogin(operAccount, operPassword, sourceIp);
  try {
    await athemeCommand([
      cookie,
      operAccount,
      sourceIp,
      "NickServ",
      "FDROP",
      nick.trim(),
    ]);
  } finally {
    try {
      await athemeLogout(cookie, operAccount);
    } catch {
      // Best-effort logout; don't mask the original error
    }
  }
}
