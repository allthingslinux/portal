// ============================================================================
// IRC Integration Schemas
// ============================================================================
// Zod schemas for IRC integration API validation

import { z } from "zod";
import { selectIrcAccountSchema } from "@portal/db/schema/irc";

import { brandedString, metadataSchema } from "../utils";
import { IRC_NICK_MAX_LENGTH, isValidIrcNick } from "./validation";

// Status enums matching database
export const IrcAccountStatusSchema = z.enum([
  "active",
  "pending",
  "suspended",
  "deleted",
]);

export const UpdateIrcAccountStatusSchema = z.enum([
  "active",
  "pending",
  "suspended",
]);

/**
 * IRC nick validation schema
 */
export const IrcNickSchema = brandedString<"IrcNick">(
  z
    .string()
    .trim()
    .min(1, "Nick is required")
    .max(
      IRC_NICK_MAX_LENGTH,
      `Nick must be ${IRC_NICK_MAX_LENGTH} characters or less`
    )
    .refine(
      isValidIrcNick,
      `Invalid nick. Use letters, digits, or [ ] \\ ^ _ \` { | } ~ - (max ${IRC_NICK_MAX_LENGTH} characters).`
    )
);

/**
 * Schema for creating an IRC account via API
 * Extends the database insert schema with custom validation.
 * Password is optional — if omitted a random one is generated and shown once.
 */
export const CreateIrcAccountRequestSchema = z.object({
  nick: IrcNickSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be 128 characters or less")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/**
 * Schema for updating an IRC account via API
 * Derives from create schema to reuse validation, then extends with update-specific fields
 */
export const UpdateIrcAccountRequestSchema =
  CreateIrcAccountRequestSchema.partial().extend({
    status: UpdateIrcAccountStatusSchema.optional(),
    metadata: metadataSchema,
  });

/**
 * Full IRC account schema (for responses)
 * Extends database select schema with proper metadata typing and integration ID
 */
export const IrcAccountSchema = selectIrcAccountSchema.extend({
  integrationId: z.literal("irc"),
  temporaryPassword: z.string().optional(), // Only present on creation
  metadata: metadataSchema,
});

// Type exports
export type IrcAccountStatus = z.infer<typeof IrcAccountStatusSchema>;
export type UpdateIrcAccountStatus = z.infer<
  typeof UpdateIrcAccountStatusSchema
>;
export type CreateIrcAccountRequest = z.infer<
  typeof CreateIrcAccountRequestSchema
>;
export type UpdateIrcAccountRequest = z.infer<
  typeof UpdateIrcAccountRequestSchema
>;
export type IrcAccount = z.infer<typeof IrcAccountSchema>;
