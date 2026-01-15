import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { handleAPIError, requireAuth } from "@/lib/api/utils";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

/**
 * GET /api/user/me
 * Get current authenticated user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    // DTO: Only return necessary fields, not entire user object
    // This prevents exposing sensitive data like internal IDs, timestamps, etc.
    const [userData] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ user: userData });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * PATCH /api/user/me
 * Update current authenticated user's profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);
    const body = await request.json();

    // Only allow updating specific fields (name, email verification handled by Better Auth)
    const [updated] = await db
      .update(user)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning({
        // DTO: Only return necessary fields in response
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      });

    if (!updated) {
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ user: updated });
  } catch (error) {
    return handleAPIError(error);
  }
}
