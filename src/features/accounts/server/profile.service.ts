import "server-only";

import { eq } from "drizzle-orm";
import { keycloakAdmin } from "~/lib/auth/keycloak-admin";
import { db } from "~/lib/database/client";
import { betterAuthUser } from "~/lib/database/schema";

type ProfileUpdateData = {
  email?: string;
  name?: string;
};

export class ProfileService {
  async updateUserProfile(userId: string, updates: ProfileUpdateData) {
    // Get current user data
    const [user] = await db
      .select()
      .from(betterAuthUser)
      .where(eq(betterAuthUser.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    // Find user in Keycloak by current email
    const keycloakUser = await keycloakAdmin.findUserByEmail(user.email);
    if (!keycloakUser) {
      throw new Error("User not found in Keycloak");
    }

    // Parse name into first/last
    const nameParts = updates.name?.split(" ") || user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Update in Keycloak first
    await keycloakAdmin.updateUser(keycloakUser.id, {
      email: updates.email || user.email,
      firstName,
      lastName,
    });

    // Update in local database
    await db
      .update(betterAuthUser)
      .set({
        email: updates.email || user.email,
        name: updates.name || user.name,
        emailVerified: updates.email ? false : user.emailVerified, // Reset if email changed
        updatedAt: new Date(),
      })
      .where(eq(betterAuthUser.id, userId));

    return { success: true };
  }
}

export const profileService = new ProfileService();
