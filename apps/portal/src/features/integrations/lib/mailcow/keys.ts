import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

/**
 * Get validated mailcow environment variables.
 * Uses t3-env for runtime validation and type safety.
 *
 * MAILCOW_API_URL: Base URL of mailcow UI only (e.g. https://mail.atl.tools).
 *   Do NOT include /api or /api/v1 — the client appends /api/v1/... paths.
 *
 * MAILCOW_OAUTH_CLIENT_ID / MAILCOW_OAUTH_CLIENT_SECRET: OAuth2 client credentials
 *   for "Sign in with Mailcow". Create via mailcow UI (Configuration > Access > OAuth2)
 *   or API POST /api/v1/add/oauth2-client with redirect_uri = Portal callback URL.
 */
export const keys = () =>
  createEnv({
    server: {
      MAILCOW_API_URL: z.url().optional(),
      MAILCOW_API_KEY: z.string().optional(),
      MAILCOW_DOMAIN: z.string().optional(),
      MAILCOW_OAUTH_CLIENT_ID: z.string().min(1).optional(),
      MAILCOW_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
    },
    client: {
      /** Webmail UI URL for "Open webmail" link. When unset, the link is hidden. */
      NEXT_PUBLIC_MAILCOW_WEB_URL: z.url().optional(),
      /**
       * Set to "true" to show "Sign in with Mailcow" on the auth page.
       * Requires MAILCOW_OAUTH_CLIENT_ID and MAILCOW_OAUTH_CLIENT_SECRET on the server.
       */
      NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED: z
        .string()
        .optional()
        .transform((v) => v === "true"),
    },
    runtimeEnv: {
      MAILCOW_API_URL: process.env.MAILCOW_API_URL,
      MAILCOW_API_KEY: process.env.MAILCOW_API_KEY,
      MAILCOW_DOMAIN: process.env.MAILCOW_DOMAIN,
      MAILCOW_OAUTH_CLIENT_ID: process.env.MAILCOW_OAUTH_CLIENT_ID,
      MAILCOW_OAUTH_CLIENT_SECRET: process.env.MAILCOW_OAUTH_CLIENT_SECRET,
      NEXT_PUBLIC_MAILCOW_WEB_URL: process.env.NEXT_PUBLIC_MAILCOW_WEB_URL,
      NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED:
        process.env.NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED,
    },
  });
