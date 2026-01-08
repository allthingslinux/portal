import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const keys = () =>
  createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(1).optional(),
      BETTER_AUTH_URL: z.url().optional(),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    },
  });
