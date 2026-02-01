import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

/**
 * IRC environment variables (Atheme JSON-RPC, server/port for UI; UnrealIRCd for admin).
 * Optional: IRC_ATHEME_INSECURE_SKIP_VERIFY, IRC_UNREAL_INSECURE_SKIP_VERIFY for internal/self-signed TLS.
 */
export const keys = () =>
  createEnv({
    server: {
      IRC_SERVER: z.string().optional(),
      IRC_PORT: z.coerce.number().optional(),
      IRC_ATHEME_JSONRPC_URL: z.string().url().optional(),
      IRC_ATHEME_INSECURE_SKIP_VERIFY: z
        .string()
        .optional()
        .transform((v) => v === "true" || v === "1"),
      IRC_UNREAL_JSONRPC_URL: z.string().url().optional(),
      IRC_UNREAL_RPC_USER: z.string().optional(),
      IRC_UNREAL_RPC_PASSWORD: z.string().optional(),
      IRC_UNREAL_INSECURE_SKIP_VERIFY: z
        .string()
        .optional()
        .transform((v) => v === "true" || v === "1"),
    },
    runtimeEnv: {
      IRC_SERVER: process.env.IRC_SERVER,
      IRC_PORT: process.env.IRC_PORT,
      IRC_ATHEME_JSONRPC_URL: process.env.IRC_ATHEME_JSONRPC_URL,
      IRC_ATHEME_INSECURE_SKIP_VERIFY:
        process.env.IRC_ATHEME_INSECURE_SKIP_VERIFY,
      IRC_UNREAL_JSONRPC_URL: process.env.IRC_UNREAL_JSONRPC_URL,
      IRC_UNREAL_RPC_USER: process.env.IRC_UNREAL_RPC_USER,
      IRC_UNREAL_RPC_PASSWORD: process.env.IRC_UNREAL_RPC_PASSWORD,
      IRC_UNREAL_INSECURE_SKIP_VERIFY:
        process.env.IRC_UNREAL_INSECURE_SKIP_VERIFY,
    },
  });
