// ============================================================================
// API Utilities
// ============================================================================
// Shared utilities for API route handlers

import "server-only";

import type { NextRequest } from "next/server";

import { isAdmin, isAdminOrStaff } from "@/lib/auth/check-role";
import { captureError, log, parseError } from "@/lib/observability";
import { auth } from "@/auth";
import type { AuthResult } from "@/types/auth";

// Re-export for backward compatibility
export type { AuthResult } from "@/types/auth";

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
    // biome-ignore lint/style/noParameterProperties: Concise error class
    // biome-ignore lint/style/useConsistentMemberAccessibility: Concise error class
    public status = 500
  ) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Handle API errors and return appropriate response
 * Uses observability utilities for consistent error handling
 */
export function handleAPIError(error: unknown): Response {
  if (error instanceof APIError) {
    return Response.json(
      { ok: false, error: error.message },
      { status: error.status }
    );
  }

  const message = parseError(error);
  captureError(error, {
    tags: {
      errorType: "api",
    },
  });
  log.error(`API Error: ${message}`);

  // Return generic error message to prevent leaking internal details
  // Detailed error information is captured in Sentry for debugging
  return Response.json(
    { ok: false, error: "Internal server error" },
    { status: 500 }
  );
}
