import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, keycloak } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import authConfig from "~/core/config/auth.config";
import { db } from "~/core/database/client";
import * as schema from "~/core/database/schema";
import { accounts, accountsMemberships } from "~/core/database/schema";

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
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.betterAuthUser,
      session: schema.betterAuthSession,
      account: schema.betterAuthAccount,
      verification: schema.betterAuthVerification,
    },
  }),
  emailAndPassword: authConfig.providers.password
    ? {
        enabled: true,
      }
    : undefined,
  socialProviders: undefined,
  plugins: [
    genericOAuth({
      config: [createKeycloakProviderConfig()],
    }),
  ],
  baseURL,
  basePath: "/api/auth",
  secret: betterAuthSecret,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { betterAuthUserIdToUuid } = await import(
              "./utils/user-id-to-uuid"
            );
            const userIdUuid = betterAuthUserIdToUuid(user.id);

            await db.transaction(async (tx) => {
              const [account] = await tx
                .insert(accounts)
                .values({
                  primaryOwnerUserId: user.id,
                  name: user.name || user.email?.split("@")[0] || "User",
                  isPersonalAccount: true,
                  publicData: {},
                })
                .returning();

              if (!account) {
                throw new Error("Failed to create personal account");
              }

              await tx.insert(accountsMemberships).values({
                userId: userIdUuid,
                accountId: account.id,
                accountRole: "owner",
              });
            });
          } catch (error) {
            console.error("Failed to create personal account for user:", error);
            // TODO: Send to error tracking service (e.g., Sentry, etc.)
            // For now, log in production too since this creates broken user state
          }
        },
      },
      update: {
        after: async (user) => {
          try {
            const { betterAuthUserIdToUuid } = await import(
              "./utils/user-id-to-uuid"
            );
            const userIdUuid = betterAuthUserIdToUuid(user.id);

            await db
              .update(accounts)
              .set({
                name: user.name || user.email?.split("@")[0] || "User",
              })
              .where(
                and(
                  eq(accounts.primaryOwnerUserId, userIdUuid),
                  eq(accounts.isPersonalAccount, true)
                )
              );
          } catch (error) {
            console.error("Failed to sync account name for user:", error);
            // TODO: Send to error tracking service
            // Account name drift can cause UX issues but isn't critical
          }
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false,
    },
  },
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

  return keycloak({
    clientId,
    clientSecret,
    issuer,
  });
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
