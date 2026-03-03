import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

/**
 * Dev tools environment keys.
 * Set NEXT_PUBLIC_DEV_TOOLS_ENABLED=false to disable all dev tools
 * (React Grab, React Scan, React Query Devtools) in development.
 */
export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_DEV_TOOLS_ENABLED: z
        .enum(["true", "false"])
        .optional()
        .default("true"),
    },
    runtimeEnv: {
      NEXT_PUBLIC_DEV_TOOLS_ENABLED: process.env.NEXT_PUBLIC_DEV_TOOLS_ENABLED,
    },
  });
