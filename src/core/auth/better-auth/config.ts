import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, keycloak } from "better-auth/plugins";
import { and, eq } from "drizzle-orm";
import authConfig from "~/core/config/auth.config";
import { db } from "~/core/database/client";
import * as schema from "~/core/database/schema";
import {
  accounts,
  accountsMemberships,
  usersInAuth,
} from "~/core/database/schema";

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
          // Create a personal account for new users
          // This ensures every user has at least one account (personal account)
          // Note: Better Auth uses text IDs, but accounts table references auth.users (UUID)
          // We need to create/update the auth.users entry first, then create the account
          try {
            // Generate a deterministic UUID from the Better Auth user ID
            const { betterAuthUserIdToUuid } = await import(
              "./utils/user-id-to-uuid"
            );
            const userIdUuid = betterAuthUserIdToUuid(user.id);

            // Create personal account and membership in a transaction
            await db.transaction(async (tx) => {
              // First, ensure the user exists in auth.users table
              await tx
                .insert(usersInAuth)
                .values({
                  id: userIdUuid,
                  email: user.email || null,
                })
                .onConflictDoUpdate({
                  target: usersInAuth.id,
                  set: {
                    email: user.email || null,
                  },
                });

              // Create the personal account
              const [account] = await tx
                .insert(accounts)
                .values({
                  primaryOwnerUserId: userIdUuid,
                  name: user.name || user.email?.split("@")[0] || "User",
                  isPersonalAccount: true,
                  publicData: {},
                })
                .returning();

              if (!account) {
                throw new Error("Failed to create personal account");
              }

              // Create membership record (required for user_accounts view)
              // Use "owner" role for personal accounts
              await tx.insert(accountsMemberships).values({
                userId: userIdUuid,
                accountId: account.id,
                accountRole: "owner",
              });
            });
          } catch (error) {
            // Log error but don't fail user creation
            // Personal account creation can be retried later
            if (process.env.NODE_ENV === "development") {
              console.error(
                "Failed to create personal account for user:",
                error
              );
            }
          }
        },
      },
      update: {
        after: async (user) => {
          // Sync account name when Better Auth user name is updated (e.g., from Keycloak)
          try {
            const { appendFileSync } = await import("node:fs");
            const { betterAuthUserIdToUuid } = await import(
              "./utils/user-id-to-uuid"
            );
            const userIdUuid = betterAuthUserIdToUuid(user.id);

            // #region agent log
            try {
              appendFileSync(
                "/home/kaizen/dev/allthingslinux/portal/.cursor/debug.log",
                `${JSON.stringify({
                  location: "config.ts:118",
                  message: "user.update hook triggered",
                  data: {
                    userId: user.id,
                    userIdUuid,
                    newName: user.name,
                    newEmail: user.email,
                  },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "post-fix",
                  hypothesisId: "F",
                })}\n`
              );
            } catch {
              /* ignore */
            }
            // #endregion

            // Update the personal account name if it exists
            const result = await db
              .update(accounts)
              .set({
                name: user.name || user.email?.split("@")[0] || "User",
              })
              .where(
                and(
                  eq(accounts.primaryOwnerUserId, userIdUuid),
                  eq(accounts.isPersonalAccount, true)
                )
              )
              .returning();

            // #region agent log
            try {
              appendFileSync(
                "/home/kaizen/dev/allthingslinux/portal/.cursor/debug.log",
                `${JSON.stringify({
                  location: "config.ts:145",
                  message: "Account name updated",
                  data: {
                    userId: user.id,
                    userIdUuid,
                    accountsUpdated: result.length,
                    accountId: result[0]?.id,
                    newAccountName: result[0]?.name,
                  },
                  timestamp: Date.now(),
                  sessionId: "debug-session",
                  runId: "post-fix",
                  hypothesisId: "F",
                })}\n`
              );
            } catch {
              /* ignore */
            }
            // #endregion
          } catch (error) {
            // Log error but don't fail user update
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to sync account name for user:", error);
            }
          }
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    // Configure cookies to work across the same domain
    // This helps prevent state mismatch errors in OAuth flows
    crossSubDomainCookies: {
      enabled: false, // Disable cross-subdomain cookies unless needed
    },
  },
});

/**
 * Build the Keycloak provider configuration after validating secrets.
 *
 * IMPORTANT: Configure the following redirect URI in Keycloak:
 * - Development: http://localhost:3000/api/auth/oauth2/callback/keycloak
 * - Production: ${baseURL}/api/auth/oauth2/callback/keycloak
 *
 * The genericOAuth plugin uses the pattern: ${baseURL}/api/auth/oauth2/callback/:providerId
 * where providerId defaults to "keycloak" when using the keycloak() helper.
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
    // Optional: You can customize the redirect URI if needed
    // redirectURI: `${baseURL}/api/auth/oauth2/callback/keycloak`,
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
