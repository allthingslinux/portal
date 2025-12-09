import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import authConfig from "~/core/config/auth.config";
import { getDrizzleSupabaseAdminClient } from "~/core/database/supabase/clients/drizzle-client";

const baseURL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000");

const betterAuthSecret = resolveBetterAuthSecret();

/**
 * Better Auth configuration
 * Migrated from NextAuth.js
 */
export const auth = betterAuth({
  database: drizzleAdapter(getDrizzleSupabaseAdminClient(), {
    provider: "pg",
  }),
  emailAndPassword: authConfig.providers.password
    ? {
        enabled: true,
      }
    : undefined,
  socialProviders: {
    ...(authConfig.providers.oAuth.includes("keycloak")
      ? createKeycloakProviderConfig()
      : {}),
  },
  baseURL,
  basePath: "/api/auth",
  secret: betterAuthSecret,
});

/**
 * Build the Keycloak provider configuration after validating secrets.
 */
function createKeycloakProviderConfig() {
  const clientId = process.env.KEYCLOAK_ID;
  const clientSecret = process.env.KEYCLOAK_SECRET;
  const issuer = process.env.KEYCLOAK_ISSUER;

  // biome-ignore lint/complexity/useSimplifiedLogicExpression: explicit env var guard preferred for clarity
  if (!clientId || !clientSecret || !issuer) {
    throw new Error("Keycloak OAuth environment variables are not set");
  }

  return {
    keycloak: {
      clientId,
      clientSecret,
      issuer,
    },
  };
}

/**
 * Resolve the Better Auth secret with a safe development fallback.
 */
function resolveBetterAuthSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.CI === "true") {
    throw new Error(
      "BETTER_AUTH_SECRET must be set in production or CI environments"
    );
  }

  // eslint-disable-next-line no-console -- log once to surface missing secret locally
  console.warn(
    "BETTER_AUTH_SECRET is not set. Using a development-only fallback. Do not use this configuration in production."
  );

  return "development-only-better-auth-secret";
}
