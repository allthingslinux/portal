import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const keys = () =>
  createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(1).optional(),
      BETTER_AUTH_URL: z.url().optional(),
      DISCORD_CLIENT_ID: z.string().min(1).optional(),
      DISCORD_CLIENT_SECRET: z.string().min(1).optional(),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
      DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    },
  });
