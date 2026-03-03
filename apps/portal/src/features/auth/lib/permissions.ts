import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// ============================================================================
// Access Control Configuration
// ============================================================================
// Define available permissions for admin operations
// Merge default admin statements with any custom resources

const statement = {
  ...defaultStatements, // Includes: user, session permissions
  // Add custom resources here if needed
  // project: ["create", "update", "delete"],
} as const;

// Create the access controller
export const ac = createAccessControl(statement);

// ============================================================================
// Role Definitions
// ============================================================================
// Define roles with specific permissions

// User role: No admin permissions (default role for regular users)
export const user = ac.newRole({
  user: [], // No user permissions
  session: [], // No session permissions
});

// Staff role: Limited admin permissions (can manage users and sessions, but not create users or impersonate)
export const staff = ac.newRole({
  user: ["list", "ban"], // Can list users and ban them
  session: ["list", "revoke"], // Can list sessions and revoke them
  // Cannot: create users, set roles, impersonate, delete users, set passwords
});

// Admin role: Full admin permissions (all user and session operations)
export const admin = ac.newRole({
  ...adminAc.statements, // Full admin permissions (all user and session operations)
});
