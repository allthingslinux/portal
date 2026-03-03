import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

/**
 * Get validated XMPP environment variables
 * Uses t3-env for runtime validation and type safety
 *
 * Auth: Prosody's mod_http_admin_api requires Bearer token auth (mod_tokenauth).
 * Set PROSODY_REST_TOKEN to a token generated via prosodyctl or OAuth2.
 *
 * @returns Validated environment configuration for XMPP/Prosody integration
 */
export const keys = () =>
  createEnv({
    server: {
      XMPP_DOMAIN: z.string().optional(),
      PROSODY_REST_URL: z.url().optional(),
      PROSODY_REST_TOKEN: z.string().optional(),
    },
    runtimeEnv: {
      XMPP_DOMAIN: process.env.XMPP_DOMAIN,
      PROSODY_REST_URL: process.env.PROSODY_REST_URL,
      PROSODY_REST_TOKEN: process.env.PROSODY_REST_TOKEN,
    },
  });
