import "server-only";

import { keys } from "./keys";

const env = keys();

export const ircConfig = {
  server: env.IRC_SERVER ?? "irc.atl.chat",
  port: env.IRC_PORT ?? 6697,
  atheme: {
    jsonrpcUrl: env.IRC_ATHEME_JSONRPC_URL,
    insecureSkipVerify: env.IRC_ATHEME_INSECURE_SKIP_VERIFY ?? false,
  },
} as const;

/**
 * Whether IRC (Atheme) provisioning is configured.
 */
export function isIrcConfigured(): boolean {
  return !!ircConfig.atheme.jsonrpcUrl;
}
