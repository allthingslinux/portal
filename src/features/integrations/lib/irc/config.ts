import "server-only";

import { keys } from "./keys";

const env = keys();

export const ircConfig = {
  server: env.IRC_SERVER ?? "irc.atl.chat",
  port: env.IRC_PORT ?? 6697,
  atheme: {
    jsonrpcUrl: env.IRC_ATHEME_JSONRPC_URL,
    insecureSkipVerify: env.IRC_ATHEME_INSECURE_SKIP_VERIFY ?? false,
    operAccount: env.IRC_ATHEME_OPER_ACCOUNT,
    operPassword: env.IRC_ATHEME_OPER_PASSWORD,
  },
  unreal: {
    jsonrpcUrl: env.IRC_UNREAL_JSONRPC_URL,
    rpcUser: env.IRC_UNREAL_RPC_USER,
    rpcPassword: env.IRC_UNREAL_RPC_PASSWORD,
    insecureSkipVerify: env.IRC_UNREAL_INSECURE_SKIP_VERIFY ?? false,
  },
} as const;

/**
 * Whether IRC (Atheme) provisioning is configured.
 */
export function isIrcConfigured(): boolean {
  return !!ircConfig.atheme.jsonrpcUrl;
}

/**
 * Whether UnrealIRCd JSON-RPC (admin) is configured.
 */
export function isUnrealConfigured(): boolean {
  return !!(
    ircConfig.unreal.jsonrpcUrl &&
    ircConfig.unreal.rpcUser &&
    ircConfig.unreal.rpcPassword
  );
}

/**
 * Whether Atheme oper credentials are configured (needed for FDROP).
 */
export function isAthemeOperConfigured(): boolean {
  return !!(ircConfig.atheme.operAccount && ircConfig.atheme.operPassword);
}
