import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const keys = () =>
  createEnv({
    server: {
      // Optional during build, required at runtime when database is accessed
      DATABASE_URL: z.url().optional(),
    },
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
