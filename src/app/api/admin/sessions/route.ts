import type { NextRequest } from "next/server";

import { isAdminOrStaff } from "@/lib/auth/check-role";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin or staff role (both can list sessions)
    if (!(await isAdminOrStaff(session.user.id))) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all sessions from database
    const sessions = await db.query.session.findMany({
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: (session, { desc }) => [desc(session.createdAt)],
    });

    return Response.json({ sessions });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
