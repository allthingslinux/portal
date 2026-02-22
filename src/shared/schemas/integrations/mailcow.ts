// ============================================================================
// Mailcow Integration Schemas
// ============================================================================
// Zod schemas for Mailcow integration API validation

import { z } from "zod";

import { selectMailcowAccountSchema } from "@/db/schema/mailcow";
import { metadataSchema } from "../utils";
import { isValidMailcowLocalPart } from "@/features/integrations/lib/mailcow/utils";

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
const MIN_PASSWORD_LENGTH = 8;
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
