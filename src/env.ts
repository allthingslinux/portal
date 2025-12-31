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

    // Keycloak Admin (optional)
    KEYCLOAK_ADMIN_USER: z.string().optional(),
    KEYCLOAK_ADMIN_PASSWORD: z.string().optional(),

    // Keycloak Database (for Docker setup)
    KEYCLOAK_DB_NAME: z.string().optional(),
    KEYCLOAK_DB_USER: z.string().optional(),
    KEYCLOAK_DB_PASSWORD: z.string().optional(),

    // Keycloak Server Configuration
    KEYCLOAK_HOSTNAME: z.string().optional(),
    KEYCLOAK_LOG_LEVEL: z.string().optional(),
    KEYCLOAK_METRICS_ENABLED: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    KEYCLOAK_FEATURES: z.string().optional(),

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
    EMAIL_SENDER: z.string().optional(),
    EMAIL_TLS: z
      .string()
      .optional()
      .transform((s) => s === "true"),

    // Contact
    CONTACT_EMAIL: z.string().email().optional(),

    // CMS
    CMS_CLIENT: z.enum(["keystatic", "wordpress"]).default("keystatic"),

    // Mailer
    MAILER_PROVIDER: z.string().optional(),

    // Supabase Server
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_DB_WEBHOOK_SECRET: z.string().optional(),

    // Portal Database Config (optional - for Docker setup)
    PORTAL_DB_NAME: z.string().optional(),
    PORTAL_DB_USER: z.string().optional(),
    PORTAL_DB_PASSWORD: z.string().optional(),
    PORTAL_DB_PORT: z.coerce.number().optional(),

    // Portal Admin Config (optional)
    PORTAL_ADMIN_EMAIL: z.string().email().optional(),
    PORTAL_ADMIN_PASSWORD: z.string().optional(),
    PORTAL_REDIRECT_URIS: z.string().optional(),
    PORTAL_WEB_ORIGINS: z.string().optional(),
    PORTAL_POST_LOGOUT_URIS: z.string().optional(),

    // Node Environment
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // Next.js
    NEXT_TELEMETRY_DISABLED: z
      .string()
      .optional()
      .transform((s) => s === "1"),

    // Skip validation flag
    SKIP_ENV_VALIDATION: z.string().optional(),

    // Docker Configuration
    POSTGRES_VERSION: z.string().optional(),
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
    NEXT_PUBLIC_DEFAULT_THEME_MODE: z
      .enum(["light", "dark", "system"])
      .default("system"),
    NEXT_PUBLIC_THEME_COLOR: z.string().default("#000000"),
    NEXT_PUBLIC_THEME_COLOR_DARK: z.string().default("#ffffff"),

    // Auth Configuration
    NEXT_PUBLIC_AUTH_PASSWORD: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_AUTH_MAGIC_LINK: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_AUTH_OTP: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_AUTH_IDENTITY_LINKING: z
      .string()
      .optional()
      .transform((s) => s === "true"),

    // Feature Flags
    NEXT_PUBLIC_ENABLE_THEME_TOGGLE: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_NOTIFICATIONS: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_REALTIME_NOTIFICATIONS: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_VERSION_UPDATER: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER: z
      .string()
      .optional()
      .transform((s) => s === "true"),

    // UI Configuration
    NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED: z
      .string()
      .optional()
      .transform((s) => s === "true"),
    NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH: z.string().optional(),
    NEXT_PUBLIC_LOCALES_PATH: z.string().optional(),
    NEXT_PUBLIC_LANGUAGE_PRIORITY: z.string().optional(),

    // External Services (with environment-based defaults)
    NEXT_PUBLIC_SUPABASE_URL: z
      .string()
      .url()
      .optional()
      .default(() =>
        process.env.NODE_ENV === "development" ? "http://127.0.0.1:54321" : ""
      ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: z.string().optional(),

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
    NEXT_PUBLIC_AUTH_PASSWORD: process.env.NEXT_PUBLIC_AUTH_PASSWORD,
    NEXT_PUBLIC_AUTH_MAGIC_LINK: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK,
    NEXT_PUBLIC_AUTH_OTP: process.env.NEXT_PUBLIC_AUTH_OTP,
    NEXT_PUBLIC_AUTH_IDENTITY_LINKING:
      process.env.NEXT_PUBLIC_AUTH_IDENTITY_LINKING,
    NEXT_PUBLIC_ENABLE_THEME_TOGGLE:
      process.env.NEXT_PUBLIC_ENABLE_THEME_TOGGLE,
    NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION:
      process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION,
    NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS:
      process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS,
    NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION:
      process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION,
    NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION:
      process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION,
    NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX:
      process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX,
    NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED:
      process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
    NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH:
      process.env.NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH,
    NEXT_PUBLIC_LOCALES_PATH: process.env.NEXT_PUBLIC_LOCALES_PATH,
    NEXT_PUBLIC_LANGUAGE_PRIORITY: process.env.NEXT_PUBLIC_LANGUAGE_PRIORITY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,
    NEXT_PUBLIC_CI: process.env.NEXT_PUBLIC_CI,
    NEXT_PUBLIC_ENABLE_NOTIFICATIONS:
      process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS,
    NEXT_PUBLIC_REALTIME_NOTIFICATIONS:
      process.env.NEXT_PUBLIC_REALTIME_NOTIFICATIONS,
    NEXT_PUBLIC_ENABLE_VERSION_UPDATER:
      process.env.NEXT_PUBLIC_ENABLE_VERSION_UPDATER,
    NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER:
      process.env.NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER,
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
