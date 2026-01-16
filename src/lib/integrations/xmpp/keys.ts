import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

/**
 * Get validated XMPP environment variables
 * Uses t3-env for runtime validation and type safety
 * @returns Validated environment configuration for XMPP/Prosody integration
 */
export const keys = () =>
  createEnv({
    server: {
      XMPP_DOMAIN: z.string().optional(),
      PROSODY_REST_URL: z.url().optional(),
      PROSODY_REST_USERNAME: z.string().optional(),
      PROSODY_ADMIN_JID: z.string().optional(),
      PROSODY_REST_PASSWORD: z.string().optional(),
      PROSODY_REST_SECRET: z.string().optional(),
    },
    runtimeEnv: {
      XMPP_DOMAIN: process.env.XMPP_DOMAIN,
      PROSODY_REST_URL: process.env.PROSODY_REST_URL,
      PROSODY_REST_USERNAME: process.env.PROSODY_REST_USERNAME,
      PROSODY_ADMIN_JID: process.env.PROSODY_ADMIN_JID,
      PROSODY_REST_PASSWORD: process.env.PROSODY_REST_PASSWORD,
      PROSODY_REST_SECRET: process.env.PROSODY_REST_SECRET,
    },
  });
