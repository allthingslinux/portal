import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

import "server-only";

/** Default ATL wiki API URL (atl.wiki has script path /, so api.php at root) */
const DEFAULT_WIKI_API_URL = "https://atl.wiki/api.php";

export const keys = () =>
  createEnv({
    server: {
      WIKI_API_URL: z.string().url(),
      WIKI_BOT_USERNAME: z.string().optional(),
      WIKI_BOT_PASSWORD: z.string().optional(),
    },
    client: {},
    runtimeEnv: {
      WIKI_API_URL: process.env.WIKI_API_URL ?? DEFAULT_WIKI_API_URL,
      WIKI_BOT_USERNAME: process.env.WIKI_BOT_USERNAME,
      WIKI_BOT_PASSWORD: process.env.WIKI_BOT_PASSWORD,
    },
  });

/**
 * Check if the wiki API URL is available (either explicitly set or via default).
 * Returns `true` when a wiki API URL is available for read-only queries.
 */
export function isWikiApiConfigured(): boolean {
  return !!(process.env.WIKI_API_URL ?? DEFAULT_WIKI_API_URL);
}

/**
 * Check if MediaWiki bot operations are fully configured.
 * Returns `true` when WIKI_API_URL, WIKI_BOT_USERNAME, and WIKI_BOT_PASSWORD
 * are all set to non-empty values.
 *
 * Uses `process.env` directly (like `isWikiApiConfigured`) so the check works
 * in test environments where `createEnv` server-side guards are not available.
 */
export function isMediaWikiConfigured(): boolean {
  const apiUrl = process.env.WIKI_API_URL ?? DEFAULT_WIKI_API_URL;
  return !!(
    apiUrl &&
    process.env.WIKI_BOT_USERNAME &&
    process.env.WIKI_BOT_PASSWORD
  );
}
