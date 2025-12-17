import { z } from "zod";

export const DeletePersonalAccountSchema = z.object({
  // OTP requirement removed - account deletion now requires only authentication
});
