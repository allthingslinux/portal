// ============================================================================
// Database Barrel Export
// ============================================================================
// This file re-exports database-related exports for @/shared/db imports.

/** biome-ignore-all lint/performance/noBarrelFile: Required for @/shared/db path alias */
export { db } from "./client";
export { relations } from "./relations";
export { schema } from "./schema";
