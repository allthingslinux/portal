// ============================================================================
// API Utilities
// ============================================================================
// Shared utilities for API route handlers

import type { NextRequest } from "next/server";

import { isAdmin, isAdminOrStaff } from "@/lib/auth/check-role";
import { auth } from "@/auth";

export interface AuthResult {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  userId: string;
}

/**
 * Authenticate and authorize request - requires admin or staff role
 */
export async function requireAdminOrStaff(
  request: NextRequest
): Promise<AuthResult> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new APIError("Unauthorized", 401);
  }

  if (!(await isAdminOrStaff(session.user.id))) {
    throw new APIError("Forbidden - Admin or Staff access required", 403);
  }

  return {
    session,
    userId: session.user.id,
  };
}

/**
 * Authenticate and authorize request - requires admin role
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new APIError("Unauthorized", 401);
  }

  if (!(await isAdmin(session.user.id))) {
    throw new APIError("Forbidden - Admin access required", 403);
  }

  return {
    session,
    userId: session.user.id,
  };
}

/**
 * Authenticate request - requires any valid session
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    throw new APIError("Unauthorized", 401);
  }

  return {
    session,
    userId: session.user.id,
  };
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status = 500
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Handle API errors and return appropriate response
 */
export function handleAPIError(error: unknown): Response {
  if (error instanceof APIError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    console.error("API Error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }

  console.error("Unknown error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
