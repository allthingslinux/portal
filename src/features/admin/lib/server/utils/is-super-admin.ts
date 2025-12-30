import { sql } from "drizzle-orm";
import { getServerSession } from "~/lib/auth/session";
import { db } from "~/lib/database/client";
import { getLogger } from "~/shared/logger";

/**
 * @name isSuperAdmin
 * @description Check if the current user is a super admin.
 * Uses NextAuth session and queries the database for super admin status.
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return false;
    }

    // Query the database to check if user is a super admin
    // This checks the app_metadata.role field in auth.users
    const result = await db.execute<{ role: string }>(
      sql`
        SELECT 
          COALESCE(
            (raw_app_meta_data->>'role')::text,
            'user'
          ) as role
        FROM auth.users
        WHERE id = ${session.user.id}
        LIMIT 1
      `
    );

    if (result.length === 0) {
      return false;
    }

    return result[0].role === "super-admin";
  } catch (error) {
    const logger = await getLogger();
    logger.error({ error }, "Error checking super admin status");
    return false;
  }
}
