import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

import "server-only";

/** Default ATL wiki API URL (atl.wiki has script path /, so api.php at root) */
const DEFAULT_WIKI_API_URL = "https://atl.wiki/api.php";

export const keys = () =>
  createEnv({
    server: {
      WIKI_API_URL: z.string().url(),
    },
    client: {},
    runtimeEnv: {
      WIKI_API_URL: process.env.WIKI_API_URL ?? DEFAULT_WIKI_API_URL,
    },
  });
