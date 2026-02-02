import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";

import { user } from "@/shared/db/schema/auth";

/**
 * Base User Schema from Database
 */
export const selectUserSchema = createSelectSchema(user);

/**
 * Client-facing User DTO Schema
 * Only exposes public/safe fields
 */
export const UserDtoSchema = selectUserSchema.pick({
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  emailVerified: true,
  createdAt: true,
  banned: true,
  banReason: true,
  banExpires: true,
});

export type UserDto = z.infer<typeof UserDtoSchema>;

/**
 * Schema for updating user profile (self-service)
 */
export const UpdateUserSelfSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  image: z.string().url("Invalid image URL").optional(),
});

/**
 * Schema for updating user data (admin/staff)
 */
export const AdminUpdateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["user", "admin", "staff"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().trim().max(500).optional(),
  banExpires: z
    .string()
    .datetime()
    .or(z.date())
    .transform((val) => (val ? new Date(val) : undefined))
    .optional(),
});

/**
 * Schema for user searching/filtering query params
 */
export const UserSearchSchema = z.object({
  role: z.string().optional(),
  banned: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});
