import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { requireAuth } from "@/shared/api/utils";
import { db } from "@/shared/db";
import { user } from "@/shared/db/schema/auth";
import {
  enrichWideEventWithUser,
  type WideEvent,
  withWideEvent,
} from "@/shared/observability";

// Route handlers are dynamic by default, but we explicitly mark them as such
// since they access database and request headers
export const dynamic = "force-dynamic";

/**
 * GET /api/user/me
 * Get current authenticated user's profile
 *
 * Uses wide events pattern: single context-rich log entry per request
 */
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    const { userId, session } = await requireAuth(request);

    // Enrich event with user context (high cardinality field)
    enrichWideEventWithUser(event, {
      id: userId,
      email: session.user.email,
    });

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
      // Enrich event with business context about the failure
      event.user_not_found = true;
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Enrich event with business context
    event.user_found = true;
    event.email_verified = userData.emailVerified;
    if (userData.role) {
      event.user_role = userData.role;
    }

    return Response.json({ user: userData });
  }
);

/**
 * PATCH /api/user/me
 * Update current authenticated user's profile
 *
 * Uses wide events pattern: single context-rich log entry per request
 */
export const PATCH = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    const { userId, session } = await requireAuth(request);
    const body = await request.json();

    // Enrich event with user context
    enrichWideEventWithUser(event, {
      id: userId,
      email: session.user.email,
    });

    // Enrich event with request context
    event.update_fields = Object.keys(body);

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
      event.user_not_found = true;
      return Response.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Enrich event with business context
    event.update_successful = true;
    event.name_updated = body.name !== undefined;
    if (updated.role) {
      event.user_role = updated.role;
    }

    return Response.json({ user: updated });
  }
);
