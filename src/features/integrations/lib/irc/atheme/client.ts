import "server-only";

import { ircConfig } from "../config";
import type { AthemeFault, AthemeFaultCode } from "../types";

/** JSON-RPC 2.0 request */
interface JsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params: string[];
  id: number;
}

/** JSON-RPC 2.0 success response */
interface JsonRpcSuccess {
  jsonrpc: "2.0";
  result: string;
  id: number;
}

/** JSON-RPC 2.0 error response (Atheme fault) */
interface JsonRpcError {
  jsonrpc: "2.0";
  error: { code: number; message: string };
  id: number;
}

/**
 * Thrown when Atheme returns a fault (e.g. nick taken, bad params).
 */
export class AthemeFaultError extends Error {
  readonly code: AthemeFaultCode;
  readonly fault: AthemeFault;

  constructor(fault: AthemeFault) {
    super(fault.message);
    this.name = "AthemeFaultError";
    this.code = fault.code;
    this.fault = fault;
  }
}

/**
 * Call Atheme atheme.command (unauthenticated).
 * Params: authcookie, account, sourceip, service, command, ...commandParams
 */
async function athemeCommand(params: string[]): Promise<string> {
  const url = ircConfig.atheme.jsonrpcUrl;
  if (!url) {
    throw new Error("IRC_ATHEME_JSONRPC_URL is not configured");
  }

  const body: JsonRpcRequest = {
    jsonrpc: "2.0",
    method: "atheme.command",
    params,
    id: 1,
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
        connect: {
          rejectUnauthorized: false,
        },
      });
    }

    const response = await fetch(url, fetchOptions);

    const data = (await response.json()) as
      | JsonRpcSuccess
      | JsonRpcError
      | { error?: { code?: number; message?: string } };

    if (!response.ok) {
      const err = data as JsonRpcError;
      const code = (err.error?.code ?? 16) as AthemeFaultCode;
      const message = err.error?.message ?? "Atheme request failed";
      throw new AthemeFaultError({ code, message });
    }

    if ("error" in data && data.error) {
      const err = data as JsonRpcError;
      const code = (err.error?.code ?? 16) as AthemeFaultCode;
      throw new AthemeFaultError({
        code,
        message: err.error.message ?? "Atheme fault",
      });
    }

    return (data as JsonRpcSuccess).result ?? "";
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Register a nick with NickServ via Atheme JSON-RPC (unauthenticated).
 * Params: '.', '', sourceip, 'NickServ', 'REGISTER', nick, password, email
 *
 * @throws AthemeFaultError on fault (e.g. 8 = alreadyexists)
 */
export async function registerNick(
  nick: string,
  password: string,
  email: string,
  sourceIp = "127.0.0.1"
): Promise<void> {
  const params = [
    ".",
    "",
    sourceIp,
    "NickServ",
    "REGISTER",
    nick.trim(),
    password,
    email.trim(),
  ];
  await athemeCommand(params);
}
