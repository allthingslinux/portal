// ============================================================================
// IRC Integration Schemas
// ============================================================================
// Zod schemas for IRC integration API validation

import { z } from "zod";

import { selectIrcAccountSchema } from "@/db/schema/irc";
import {
  IRC_NICK_MAX_LENGTH,
  isValidIrcNick,
} from "@/features/integrations/lib/irc/utils";

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
 * Schema for creating an IRC account via API
 * Extends the database insert schema with custom validation
 */
export const CreateIrcAccountRequestSchema = z.object({
  nick: z
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
    ),
});

/**
 * Schema for updating an IRC account via API
 * Derives from create schema to reuse validation, then extends with update-specific fields
 */
export const UpdateIrcAccountRequestSchema =
  CreateIrcAccountRequestSchema.partial().extend({
    status: UpdateIrcAccountStatusSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  });

/**
 * Full IRC account schema (for responses)
 * Extends database select schema with proper metadata typing and integration ID
 */
export const IrcAccountSchema = selectIrcAccountSchema
  .extend({
    integrationId: z.literal("irc"),
    temporaryPassword: z.string().optional(), // Only present on creation
  })
  .transform((data) => ({
    ...data,
    // Transform metadata from unknown to proper type
    metadata: data.metadata as Record<string, unknown> | undefined,
  }));

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
