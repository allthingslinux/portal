import "dotenv/config";

import { eq } from "drizzle-orm";

import { user } from "@/db/schema/auth";

import { auth } from "./lib/auth-for-script";
import { db } from "./lib/db";

// ============================================================================
// Create Admin User Script
// ============================================================================
// This script creates the initial admin user for the Portal application.
// It uses script-only db and auth (scripts/lib/) so it can run under tsx
// without pulling in "server-only" modules. It calls Better Auth's signUpEmail
// then updates the user role to "admin" in the database.
//
// Usage:
//   pnpm create-admin
//
// Environment Variables:
//   DATABASE_URL - Required. PostgreSQL connection string.
//   BETTER_AUTH_SECRET - Required. Same secret as the app.
//   BETTER_AUTH_URL - Optional (default: http://localhost:3000).
//   ADMIN_EMAIL - Email for the admin user (default: "admin@portal.com")
//   ADMIN_PASSWORD - Password for the admin user (default: "admin123")
//   ADMIN_NAME - Name for the admin user (default: "Admin User")

async function createAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@portal.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "Admin User";

  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, adminEmail))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("ℹ️  Admin user already exists:", adminEmail);
      console.log("   Role:", existingAdmin[0].role || "user");
      return;
    }

    // Create admin user using Better Auth API
    // Note: signUpEmail doesn't require headers for initial signup
    const newAdmin = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      },
    });

    if (!newAdmin?.user) {
      throw new Error(
        "Failed to create user: No user returned from signUpEmail"
      );
    }

    // Update user role to admin
    // We directly update the database since we don't have an admin yet
    // to use the admin API's setRole method
    const updatedUser = await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, newAdmin.user.id))
      .returning();

    if (updatedUser.length === 0) {
      throw new Error("Failed to update user role to admin");
    }

    console.log("✅ Admin user created successfully!");
    console.log("   Email:", adminEmail);
    console.log("   Name:", adminName);
    console.log("   Password:", adminPassword);
    console.log("   Role:", updatedUser[0].role);
    console.log("   ⚠️  Please change the password after first login!");
  } catch (error) {
    console.error("❌ Failed to create admin user:");
    if (error instanceof Error) {
      console.error("   Error:", error.message);
      if (error.stack) {
        console.error("   Stack:", error.stack);
      }
    } else {
      console.error("   Error:", error);
    }
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createAdminUser };
