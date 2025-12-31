import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth, keycloak } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "~/lib/database/client";
import * as schema from "~/lib/database/schema";
import { accounts, accountsMemberships } from "~/lib/database/schema";
import { env } from "../../env";

const baseURL = env.NEXT_PUBLIC_SITE_URL;

/**
 * Better Auth configuration - Multi-provider with Keycloak, GitHub, Discord
 *
 * Database stores: users, accounts (OAuth tokens)
 * Stateless: sessions (cookie-based, no DB lookups)
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: "cookie", // Store OAuth state in cookie, not DB
  },
  socialProviders: {
    // GitHub for developer users
    github: {
      clientId: env.GITHUB_CLIENT_ID || "",
      clientSecret: env.GITHUB_CLIENT_SECRET || "",
    },
    // Discord for community users
    discord: {
      clientId: env.DISCORD_CLIENT_ID || "",
      clientSecret: env.DISCORD_CLIENT_SECRET || "",
    },
  },
  plugins: [
    // Keycloak for staff/admin users
    genericOAuth({
      config: [createKeycloakProviderConfig()],
    }),
  ],
  baseURL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.NEXT_PUBLIC_SITE_URL],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create personal account when user first signs in
          try {
            await db.transaction(async (tx) => {
              const [account] = await tx
                .insert(accounts)
                .values({
                  primaryOwnerUserId: user.id,
                  name: user.name || user.email?.split("@")[0] || "User",
                  publicData: {},
                })
                .returning();

              if (!account) {
                throw new Error("Failed to create personal account");
              }

              await tx.insert(accountsMemberships).values({
                userId: user.id,
                accountId: account.id,
                accountRole: "owner",
              });
            });
          } catch (error) {
            console.error("Failed to create personal account for user:", error);
          }
        },
      },
      update: {
        after: async (user) => {
          // Sync account name when user updates profile
          try {
            await db
              .update(accounts)
              .set({ name: user.name || user.email?.split("@")[0] || "User" })
              .where(eq(accounts.primaryOwnerUserId, user.id));
          } catch (error) {
            console.error("Failed to sync account name for user:", error);
          }
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: env.NODE_ENV === "production",
    crossSubDomainCookies: { enabled: false },
  },
});

function createKeycloakProviderConfig() {
  return keycloak({
    clientId: env.KEYCLOAK_ID,
    clientSecret: env.KEYCLOAK_SECRET,
    issuer: env.KEYCLOAK_ISSUER,
    pkce: true, // Enable PKCE for Keycloak
  });
}
