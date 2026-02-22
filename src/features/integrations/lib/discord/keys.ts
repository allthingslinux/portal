import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

import "server-only";

export const keys = () =>
  createEnv({
    server: {
      DISCORD_BOT_TOKEN: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_DISCORD_GUILD_ID: z.string().min(1).optional(),
    },
    runtimeEnv: {
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
      NEXT_PUBLIC_DISCORD_GUILD_ID: process.env.NEXT_PUBLIC_DISCORD_GUILD_ID,
    },
  });
