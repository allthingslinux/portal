import { z } from "zod";

export const DeleteTeamAccountSchema = z.object({
  accountId: z.string().uuid(),
  // OTP requirement removed - account deletion now requires only authentication
});
