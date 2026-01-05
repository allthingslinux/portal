/** biome-ignore-all lint/performance/noBarrelFile: Required for @/auth path alias */

// ============================================================================
// Auth Module Exports
// ============================================================================
// Central export point for Better Auth configuration and client
// This barrel file is necessary for the @/auth path alias to work

export type { AuthClient } from "./client";
export { authClient } from "./client";
export type { Session } from "./config";
export { auth } from "./config";
export { serverClient } from "./server-client";
