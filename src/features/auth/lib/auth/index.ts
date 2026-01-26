/** biome-ignore-all lint/performance/noBarrelFile: Required for @/features/auth/lib path alias */

// ============================================================================
// Auth Module Exports
// ============================================================================
// Central export point for Better Auth configuration and client
// This barrel file is necessary for the @/features/auth/lib path alias to work

export type { AuthClient } from "./client";
export { authClient } from "./client";
export type { Session } from "./config";
export { auth } from "./config";
export {
  getUser,
  verifyAdminOrStaffSession,
  verifyAdminSession,
  verifySession,
} from "./dal";
export { serverClient } from "./server-client";
export {
  SessionProvider,
  usePermissions,
  useSession,
} from "./session-context";
