// ============================================================================
// Mailcow Integration Schemas
// ============================================================================
// Zod schemas for Mailcow integration API validation

import { z } from "zod";
import { selectMailcowAccountSchema } from "@portal/db/schema/mailcow";

import { metadataSchema } from "../utils";
import { isValidMailcowLocalPart } from "./validation";

export const MailcowAccountStatusSchema = z.enum([
  "active",
  "suspended",
  "deleted",
]);

export const UpdateMailboxStatusSchema = z.enum(["active", "suspended"]);

/**
 * Mailcow local_part validation (plain string for form compatibility)
 */
export const MailcowLocalPartSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(64)
  .refine(
    isValidMailcowLocalPart,
    "Invalid format. Use letters, numbers, dots, hyphens, or underscores. Must start with a letter or number."
  );

/**
 * Password with minimum length
 */
const MIN_PASSWORD_LENGTH = 6;
export const MailcowPasswordSchema = z
  .string()
  .min(
    MIN_PASSWORD_LENGTH,
    `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  );

export const CreateMailboxRequestSchema = z
  .object({
    local_part: MailcowLocalPartSchema,
    password: MailcowPasswordSchema,
    password2: z.string(),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords do not match",
    path: ["password2"],
  });

export const UpdateMailboxRequestSchema = z.object({
  status: UpdateMailboxStatusSchema.optional(),
  password: MailcowPasswordSchema.optional(),
  metadata: metadataSchema,
});

export const MailcowAccountSchema = selectMailcowAccountSchema.extend({
  integrationId: z.literal("mailcow"),
  metadata: metadataSchema,
});

export type MailcowAccountStatus = z.infer<typeof MailcowAccountStatusSchema>;
export type UpdateMailboxStatus = z.infer<typeof UpdateMailboxStatusSchema>;
export type CreateMailboxRequest = z.infer<typeof CreateMailboxRequestSchema>;
export type UpdateMailboxRequest = z.infer<typeof UpdateMailboxRequestSchema>;
export type MailcowAccount = z.infer<typeof MailcowAccountSchema>;

/**
 * App Password Schemas
 */
export const MailcowAppPasswordSchema = z.object({
  id: z.coerce.string(),
  active: z.coerce.number(),
  name: z.string().optional(),
  created: z.string().optional(),
  app_passwd: z.string().optional(), // only returned on creation
});

export const CreateAppPasswordRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type MailcowAppPassword = z.infer<typeof MailcowAppPasswordSchema>;
export type CreateAppPasswordRequest = z.infer<
  typeof CreateAppPasswordRequestSchema
>;

/**
 * Alias Schemas
 */
export const MailcowAliasSchema = z.object({
  id: z.coerce.string(),
  address: z.string().email(),
  goto: z.string(),
  active: z.coerce.number(),
  public_comment: z.string().nullish(),
  private_comment: z.string().nullish(),
});

export const CreateAliasRequestSchema = z.object({
  address: z.string().email("Invalid alias address"),
  goto: z.string().email("Invalid destination address"),
  active: z.boolean().default(true),
  public_comment: z.string().optional(),
});

export type MailcowAlias = z.infer<typeof MailcowAliasSchema>;
export type CreateAliasRequest = z.infer<typeof CreateAliasRequestSchema>;

/**
 * Mailbox Detail Schema (for usage/quota)
 */
export const MailcowMailboxSchema = z.object({
  username: z.string(),
  name: z.string(),
  quota: z.coerce.number(), // Total quota in bytes
  quota_used: z.coerce.number().optional(), // Used quota in bytes
  messages: z.coerce.number().optional(),
  active: z.coerce.number(),
  last_login: z.coerce.number().optional(),
});

export type MailcowMailbox = z.infer<typeof MailcowMailboxSchema>;
