// ============================================================================
// Database Barrel Export
// ============================================================================
// This file re-exports database-related exports for @/lib/db imports.

/** biome-ignore-all lint/performance/noBarrelFile: Required for @/lib/db path alias */
export { db } from "./client";
export { relations } from "./relations";
export { schema } from "./schema";
