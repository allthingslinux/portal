import "server-only";

import { ircConfig } from "../config";
import type { AnyAthemeFaultCode, AthemeFault } from "../types";

// Atheme RESETPASS response: "The password for nick has been changed to password."
// \x02 is the IRC bold control character — intentional, not a bug.
// biome-ignore lint/suspicious/noControlCharactersInRegex: Atheme uses IRC bold byte (\x02) in RESETPASS responses
const RESETPASS_BOLD_RE = /changed to ([^]+)/;
const RESETPASS_FALLBACK_RE = /changed to (.+?)\./;

// OperServ UPTIME response parsing
const REGISTERED_ACCOUNTS_RE = /Registered accounts:\s*(\d+)/;
const USERS_ONLINE_RE = /Users currently online:\s*(\d+)/;

/**
 * JSON-RPC request for Atheme.
 * NOTE: Atheme implements JSON-RPC 1.0 style (returns both result and error
 * in every response). The `jsonrpc` field is ignored by Atheme but included
 * for spec compliance. Atheme requires `id` as a string.
 */
interface JsonRpcRequest {
  id: string;
  jsonrpc: "2.0";
  method: string;
  params: string[];
}

/** JSON-RPC success response — result is always a string for atheme.command */
interface JsonRpcSuccess {
  error: null;
  id: string;
  result: string;
}

/** JSON-RPC success response with object result (atheme.ison) */
interface JsonRpcObjectSuccess<T> {
  error: null;
  id: string;
  result: T;
}

/** JSON-RPC error response (Atheme fault) */
interface JsonRpcError {
  error: { code: number; message: string };
  id: string;
  result: null;
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

    // Atheme JSONRPC always returns HTTP 200 — errors are in the JSON body.
    // Responses are JSON-RPC 1.0 style: both `result` and `error` are present.
    // On success: result has value, error is null.
    // On failure: result is null, error has { code, message }.
    const data = (await response.json()) as
      | JsonRpcSuccess
      | JsonRpcObjectSuccess<T>
      | JsonRpcError;

    if (data.error) {
      const code = (data.error.code ?? 16) as AnyAthemeFaultCode;
      throw new AthemeFaultError({
        code,
        message: data.error.message ?? "Atheme fault",
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
  /** Account name the nick is authed to, or "*" if not authed */
  accountname: string;
  online: boolean;
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

/**
 * Set a vhost on a NickServ account via HostServ VHOST (oper command).
 * Applied immediately and on every future identify.
 * Requires IRC_ATHEME_OPER_ACCOUNT + IRC_ATHEME_OPER_PASSWORD.
 *
 * @param nick - The account to set the vhost on
 * @param vhost - The vhost string (e.g. "kaizen@atl.chat")
 * @throws Error if oper credentials are not configured
 * @throws AthemeFaultError on Atheme failure
 */
export async function setVhost(
  nick: string,
  vhost: string,
  sourceIp = "127.0.0.1"
): Promise<void> {
  const { operAccount, operPassword } = ircConfig.atheme;
  if (!(operAccount && operPassword)) {
    throw new Error(
      "IRC_ATHEME_OPER_ACCOUNT and IRC_ATHEME_OPER_PASSWORD must be configured for VHOST"
    );
  }

  const cookie = await athemeLogin(operAccount, operPassword, sourceIp);
  try {
    await athemeCommand([
      cookie,
      operAccount,
      sourceIp,
      "HostServ",
      "VHOST",
      nick.trim(),
      vhost,
    ]);
  } finally {
    try {
      await athemeLogout(cookie, operAccount);
    } catch {
      // Best-effort logout
    }
  }
}

/**
 * Reset a NickServ account password using oper RESETPASS.
 *
 * If `newPassword` is provided, uses a two-step approach:
 *   1. Oper calls RESETPASS → Atheme generates a random password
 *   2. Login as the target user with the random password
 *   3. Call NickServ SET PASSWORD with the user's chosen password
 *   4. Logout the target user session
 *
 * If `newPassword` is omitted, just does RESETPASS and returns the random password.
 *
 * @param nick - The NickServ account to reset
 * @param newPassword - If provided, set this as the final password (two-step)
 * @returns The final password (user-chosen if provided, otherwise the random one)
 * @throws Error if oper credentials are not configured
 * @throws AthemeFaultError on Atheme failure (e.g. code 3 = nick not registered)
 */
export async function resetNickPassword(
  nick: string,
  newPassword?: string,
  sourceIp = "127.0.0.1"
): Promise<string> {
  const { operAccount, operPassword } = ircConfig.atheme;
  if (!(operAccount && operPassword)) {
    throw new Error(
      "IRC_ATHEME_OPER_ACCOUNT and IRC_ATHEME_OPER_PASSWORD must be configured for RESETPASS"
    );
  }

  // Step 1: Oper RESETPASS — Atheme generates a random password
  const operCookie = await athemeLogin(operAccount, operPassword, sourceIp);
  let randomPassword: string;
  try {
    const result = await athemeCommand([
      operCookie,
      operAccount,
      sourceIp,
      "NickServ",
      "RESETPASS",
      nick.trim(),
    ]);
    // Atheme RESETPASS response: "The password for \x02nick\x02 has been changed to \x02password\x02."
    const match = result.match(RESETPASS_BOLD_RE);
    if (match?.[1]) {
      randomPassword = match[1];
    } else {
      // Fallback: try without bold markers (\x02)
      const fallback = result.match(RESETPASS_FALLBACK_RE);
      if (fallback?.[1]) {
        randomPassword = fallback[1].trim();
      } else {
        throw new Error(
          `Could not parse new password from RESETPASS response: ${result}`
        );
      }
    }
  } finally {
    try {
      await athemeLogout(operCookie, operAccount);
    } catch {
      // Best-effort logout; don't mask the original error
    }
  }

  // If no custom password requested, return the random one
  if (!newPassword) {
    return randomPassword;
  }

  // Step 2: Login as the target user with the random password
  const targetCookie = await athemeLogin(nick.trim(), randomPassword, sourceIp);
  try {
    // Step 3: NickServ SET PASSWORD — only works for the currently authenticated user
    await athemeCommand([
      targetCookie,
      nick.trim(),
      sourceIp,
      "NickServ",
      "SET",
      "PASSWORD",
      newPassword,
    ]);
  } finally {
    // Step 4: Logout the target user session
    try {
      await athemeLogout(targetCookie, nick.trim());
    } catch {
      // Best-effort logout
    }
  }

  return newPassword;
}

// ============================================================================
// IRC Server Stats (OperServ UPTIME)
// ============================================================================

export interface IrcServerStats {
  registeredAccounts: number;
  usersOnline: number;
}

/**
 * Fetch IRC server stats via OperServ UPTIME (requires oper credentials).
 *
 * Parses lines like:
 *   "Registered accounts: 42"
 *   "Users currently online: 7"
 */
export async function getIrcStats(
  sourceIp = "127.0.0.1"
): Promise<IrcServerStats> {
  const { operAccount, operPassword } = ircConfig.atheme;
  if (!(operAccount && operPassword)) {
    throw new Error(
      "IRC_ATHEME_OPER_ACCOUNT and IRC_ATHEME_OPER_PASSWORD must be configured for stats"
    );
  }

  const cookie = await athemeLogin(operAccount, operPassword, sourceIp);
  try {
    const result = await athemeCommand([
      cookie,
      operAccount,
      sourceIp,
      "OperServ",
      "UPTIME",
    ]);

    const registeredMatch = result.match(REGISTERED_ACCOUNTS_RE);
    const onlineMatch = result.match(USERS_ONLINE_RE);

    return {
      registeredAccounts: registeredMatch ? Number(registeredMatch[1]) : 0,
      usersOnline: onlineMatch ? Number(onlineMatch[1]) : 0,
    };
  } finally {
    try {
      await athemeLogout(cookie, operAccount);
    } catch {
      // Best-effort logout
    }
  }
}
