"use server";

import { and, eq } from "drizzle-orm";

import { db } from "~/core/database/client";
import {
  accounts,
  betterAuthAccount,
  betterAuthUser,
} from "~/core/database/schema";
import { getSessionUserData } from "../session";

// Track when we last updated Keycloak to prevent immediate sync overwrite
let lastKeycloakUpdateTime = 0;
const KEYCLOAK_UPDATE_COOLDOWN = 5000; // 5 seconds

/**
 * Mark that we just updated Keycloak (called from updateAccountDataAction)
 */
export async function markKeycloakUpdate() {
  lastKeycloakUpdateTime = Date.now();
}

/**
 * Check if we recently updated Keycloak (to prevent sync overwrite)
 */
function shouldSkipKeycloakSync(): boolean {
  const timeSinceUpdate = Date.now() - lastKeycloakUpdateTime;
  return timeSinceUpdate < KEYCLOAK_UPDATE_COOLDOWN;
}

const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_SECRET;

/**
 * Sync user data from Keycloak using refresh token
 * This allows updating user profile without requiring re-login
 */
export async function syncUserFromKeycloak(): Promise<{
  success: boolean;
  updated: boolean;
  error?: string;
}> {
  // Skip sync if we recently updated Keycloak (to prevent overwrite)
  if (shouldSkipKeycloakSync()) {
    return { success: true, updated: false };
  }

  try {
    // Get current user session
    const user = await getSessionUserData();
    if (!user) {
      return { success: false, updated: false, error: "Not authenticated" };
    }

    // Get Keycloak account record with refresh token
    const accountRecords = await db
      .select()
      .from(betterAuthAccount)
      .where(
        and(
          eq(betterAuthAccount.userId, user.id),
          eq(betterAuthAccount.providerId, "keycloak")
        )
      )
      .limit(1);

    if (accountRecords.length === 0) {
      return {
        success: false,
        updated: false,
        error: "No Keycloak account found",
      };
    }

    const account = accountRecords[0];
    if (!account.refreshToken) {
      return {
        success: false,
        updated: false,
        error: "No refresh token available",
      };
    }

    if (!(KEYCLOAK_ISSUER && KEYCLOAK_CLIENT_ID && KEYCLOAK_CLIENT_SECRET)) {
      return {
        success: false,
        updated: false,
        error: "Keycloak configuration missing",
      };
    }

    // Extract realm from issuer (e.g., http://localhost:8080/realms/myrealm -> myrealm)
    const issuerUrl = new URL(KEYCLOAK_ISSUER);
    const realm = issuerUrl.pathname.split("/realms/")[1]?.split("/")[0];
    if (!realm) {
      return {
        success: false,
        updated: false,
        error: "Invalid Keycloak issuer URL",
      };
    }

    const tokenUrl = `${issuerUrl.origin}/realms/${realm}/protocol/openid-connect/token`;

    // Use refresh token to get new access token
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return {
        success: false,
        updated: false,
        error: `Failed to refresh token: ${errorText}`,
      };
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
    };

    if (!tokenData.access_token) {
      return {
        success: false,
        updated: false,
        error: "No access token in response",
      };
    }

    // Fetch user info from Keycloak
    const userInfoUrl = `${issuerUrl.origin}/realms/${realm}/protocol/openid-connect/userinfo`;
    const userInfoResponse = await fetch(userInfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      return {
        success: false,
        updated: false,
        error: `Failed to fetch user info: ${errorText}`,
      };
    }

    const keycloakUser = (await userInfoResponse.json()) as {
      sub?: string;
      name?: string;
      email?: string;
      preferred_username?: string;
      given_name?: string;
      family_name?: string;
    };

    // Compare with current Better Auth user data
    const currentUser = await db
      .select()
      .from(betterAuthUser)
      .where(eq(betterAuthUser.id, user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return {
        success: false,
        updated: false,
        error: "User not found in database",
      };
    }

    const currentUserData = currentUser[0];
    // Privacy-conscious: Use Keycloak's merged "name" field (which combines first+last)
    // Only fall back to merging first+last if name is not available
    // This avoids storing first/last name separately, reducing data collection concerns
    const keycloakName =
      keycloakUser.name || // Keycloak's merged name field (preferred)
      keycloakUser.preferred_username || // Username fallback
      (keycloakUser.given_name && keycloakUser.family_name
        ? `${keycloakUser.given_name} ${keycloakUser.family_name}` // Merge only if name unavailable
        : null) ||
      keycloakUser.email?.split("@")[0] || // Email prefix fallback
      "User";

    const keycloakEmail = keycloakUser.email || currentUserData.email;

    // Check if update is needed
    const needsUpdate =
      currentUserData.name !== keycloakName ||
      currentUserData.email !== keycloakEmail;

    if (!needsUpdate) {
      // Update refresh token if provided (for token rotation)
      if (
        tokenData.refresh_token &&
        tokenData.refresh_token !== account.refreshToken
      ) {
        await db
          .update(betterAuthAccount)
          .set({
            refreshToken: tokenData.refresh_token,
            accessToken: tokenData.access_token,
            updatedAt: new Date(),
          })
          .where(eq(betterAuthAccount.id, account.id));
      }

      return { success: true, updated: false };
    }

    // Update Better Auth user (this will trigger the user.update hook)
    await db
      .update(betterAuthUser)
      .set({
        name: keycloakName,
        email: keycloakEmail,
        updatedAt: new Date(),
      })
      .where(eq(betterAuthUser.id, user.id));

    // Update personal account name directly (since hooks don't fire on direct DB updates)
    await db
      .update(accounts)
      .set({
        name: keycloakName,
      })
      .where(
        and(
          eq(accounts.primaryOwnerUserId, user.id),
          eq(accounts.isPersonalAccount, true)
        )
      )
      .returning();

    // Update account tokens if provided
    if (tokenData.refresh_token || tokenData.access_token) {
      await db
        .update(betterAuthAccount)
        .set({
          refreshToken: tokenData.refresh_token || account.refreshToken,
          accessToken: tokenData.access_token || account.accessToken,
          updatedAt: new Date(),
        })
        .where(eq(betterAuthAccount.id, account.id));
    }

    return { success: true, updated: true };
  } catch (error) {
    return {
      success: false,
      updated: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
