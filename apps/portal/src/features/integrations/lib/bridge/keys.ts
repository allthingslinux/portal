import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

/**
 * Bridge integration env vars (atl.chat bridge ↔ Portal identity API).
 * When BRIDGE_SERVICE_TOKEN is set, the bridge can authenticate to GET /api/bridge/identity
 * with Bearer {token}. Must match atl.chat's BRIDGE_PORTAL_TOKEN (same secret, different names).
 */
export const keys = () =>
  createEnv({
    server: {
      BRIDGE_SERVICE_TOKEN: z.string().optional(),
    },
    runtimeEnv: {
      BRIDGE_SERVICE_TOKEN: process.env.BRIDGE_SERVICE_TOKEN,
    },
  });
