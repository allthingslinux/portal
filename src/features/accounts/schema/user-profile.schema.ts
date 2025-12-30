import { z } from "zod";

export const UserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
});

export type UserProfileData = z.infer<typeof UserProfileSchema>;
