// ============================================================================
// API Utilities
// ============================================================================
// Shared utilities for API route handlers

import "server-only";

import type { NextRequest } from "next/server";
import { z } from "zod";
import { fromError, isZodErrorLike } from "zod-validation-error";

import { auth } from "@/auth";
import { isAdmin, isAdminOrStaff } from "@/auth/check-role";
import { captureError, log, parseError } from "@/shared/observability";
import type { AuthResult } from "@/shared/types/auth";

// Re-export for backward compatibility
export type { AuthResult } from "@/shared/types/auth";

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
 * Schema for [id] route params. Reject empty, oversize, or non-string values.
 * Use before DB or downstream logic (Data security checklist).
 */
const routeIdSchema = z.string().min(1).max(128);

/**
 * Parse and validate an [id] route param. Throws APIError(400) on invalid format.
 */
export function parseRouteId(value: string | string[] | undefined): string {
  const raw = typeof value === "string" ? value : value?.[0];
  const result = routeIdSchema.safeParse(raw);
  if (!result.success) {
    throw new APIError("Invalid id format", 400);
  }
  return result.data;
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    // biome-ignore lint/style/noParameterProperties: Concise error class
    // biome-ignore lint/style/useConsistentMemberAccessibility: Concise error class
    public status = 500,
    // biome-ignore lint/style/noParameterProperties: Concise error class
    // biome-ignore lint/style/useConsistentMemberAccessibility: Concise error class
    public details?: unknown
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
      {
        ok: false,
        error: error.message,
        details: error.details,
      },
      { status: error.status }
    );
  }

  // Handle Zod validation errors automatically
  if (isZodErrorLike(error)) {
    const validationError = fromError(error);
    return Response.json(
      {
        ok: false,
        error: validationError.toString(),
        details: error.issues, // Expose raw issues for debug/advanced client handling
      },
      { status: 400 }
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
