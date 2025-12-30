"use server";

import type { UserProfileData } from "../schema/user-profile.schema";
import { profileService } from "./profile.service";

export async function updateUserProfileAction(
  userId: string,
  data: UserProfileData
) {
  try {
    await profileService.updateUserProfile(userId, data);
    return { success: true };
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
