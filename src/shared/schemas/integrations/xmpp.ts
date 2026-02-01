// ============================================================================
// XMPP Integration Schemas
// ============================================================================
// Zod schemas for XMPP integration API validation

import { z } from "zod";

import { selectXmppAccountSchema } from "@/db/schema/xmpp";
import { brandedString, metadataSchema } from "../utils";
import { isValidXmppUsername } from "@/features/integrations/lib/xmpp/utils";

// Status enums matching database
export const XmppAccountStatusSchema = z.enum([
  "active",
  "suspended",
  "deleted",
]);

export const UpdateXmppAccountStatusSchema = z.enum(["active", "suspended"]);

/**
 * XMPP username validation schema
 * Normalizes empty strings to undefined to allow auto-generation
 */
export const XmppUsernameSchema = brandedString<"XmppUsername">(
  z
    .string()
    .trim()
    .min(1)
    .refine(
      isValidXmppUsername,
      "Invalid username format. Username must be alphanumeric with underscores, hyphens, or dots, and start with a letter or number."
    )
)
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Schema for creating an XMPP account via API
 * Username is optional (will be generated from email if not provided)
 */
export const CreateXmppAccountRequestSchema = z.object({
  username: XmppUsernameSchema,
});

/**
 * Schema for updating an XMPP account via API
 * Derives from create schema to reuse validation, then extends with update-specific fields
 */
export const UpdateXmppAccountRequestSchema =
  CreateXmppAccountRequestSchema.partial().extend({
    status: UpdateXmppAccountStatusSchema.optional(),
    metadata: metadataSchema,
  });

/**
 * Full XMPP account schema (for responses)
 * Extends database select schema with proper metadata typing and integration ID
 */
export const XmppAccountSchema = selectXmppAccountSchema.extend({
  integrationId: z.literal("xmpp"),
  metadata: metadataSchema,
});

// Type exports
export type XmppAccountStatus = z.infer<typeof XmppAccountStatusSchema>;
export type UpdateXmppAccountStatus = z.infer<
  typeof UpdateXmppAccountStatusSchema
>;
export type CreateXmppAccountRequest = z.infer<
  typeof CreateXmppAccountRequestSchema
>;
export type UpdateXmppAccountRequest = z.infer<
  typeof UpdateXmppAccountRequestSchema
>;
export type XmppAccount = z.infer<typeof XmppAccountSchema>;
