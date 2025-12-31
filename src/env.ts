import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Database
    DATABASE_URL: z.string().url(),
    
    // Auth
    BETTER_AUTH_SECRET: z.string().min(1),
    KEYCLOAK_ID: z.string().min(1),
    KEYCLOAK_SECRET: z.string().min(1),
    KEYCLOAK_ISSUER: z.string().url(),
    
    // OAuth Providers (optional)
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    
    // Email
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.coerce.number().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_SENDER: z.string().email().optional(),
    
    // Contact
    CONTACT_EMAIL: z.string().email().optional(),
    
    // CMS
    CMS_CLIENT: z.enum(["keystatic", "wordpress"]).default("keystatic"),
    
    // Node Environment
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // App Configuration
    NEXT_PUBLIC_PRODUCT_NAME: z.string().min(1),
    NEXT_PUBLIC_SITE_TITLE: z.string().min(1),
    NEXT_PUBLIC_SITE_DESCRIPTION: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("en"),
    NEXT_PUBLIC_DEFAULT_THEME_MODE: z.enum(["light", "dark", "system"]).default("system"),
    NEXT_PUBLIC_THEME_COLOR: z.string().default("#000000"),
    NEXT_PUBLIC_THEME_COLOR_DARK: z.string().default("#ffffff"),
    
    // Optional CI flag
    NEXT_PUBLIC_CI: z
      .string()
      .optional()
      .transform((s) => s === "true"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   * 
   * For Next.js >= 13.4.4, you only need to destructure client variables:
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME,
    NEXT_PUBLIC_SITE_TITLE: process.env.NEXT_PUBLIC_SITE_TITLE,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_DEFAULT_THEME_MODE: process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
    NEXT_PUBLIC_THEME_COLOR: process.env.NEXT_PUBLIC_THEME_COLOR,
    NEXT_PUBLIC_THEME_COLOR_DARK: process.env.NEXT_PUBLIC_THEME_COLOR_DARK,
    NEXT_PUBLIC_CI: process.env.NEXT_PUBLIC_CI,
  },
  
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
