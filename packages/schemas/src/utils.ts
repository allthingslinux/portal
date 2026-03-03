// ============================================================================
// Schema Utilities
// ============================================================================
// Reusable Zod schema utilities and helpers

import { z } from "zod";

/**
 * Create a status enum schema from an array of status values
 */
export function createStatusEnumSchema<
  T extends readonly [string, ...string[]],
>(values: T) {
  return z.enum(values);
}

/**
 * Metadata schema for JSONB fields
 * Safe schema for parsing metadata objects, allowing null or undefined
 */
/**
 * Metadata schema for JSONB fields
 * Safe schema for parsing metadata objects, converting null to undefined for interface compatibility
 */
export const metadataSchema = z.preprocess(
  (val) => (val === null ? undefined : val),
  z.record(z.string(), z.unknown()).optional()
);

/**
 * UUID schema with validation
 */
export const uuidSchema = z.string().uuid();

/**
 * Non-empty string schema
 */
export const nonEmptyStringSchema = z.string().min(1);

/**
 * Optional non-empty string (empty strings become undefined)
 */
export const optionalNonEmptyStringSchema = z
  .string()
  .min(1)
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Helper for creating branded string schemas
 */
export function brandedString<T extends string>(schema: z.ZodString) {
  return schema.brand<T>();
}
