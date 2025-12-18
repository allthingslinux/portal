import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { HTTP_STATUS } from "~/shared/constants";
import { API_ERRORS } from "~/shared/constants/errors";

/**
 * Creates a standardized error response for API routes
 *
 * @param error - The error that occurred
 * @param defaultMessage - Default error message if error is not a known type
 * @returns NextResponse with error details
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = API_ERRORS.INVALID_REQUEST_BODY
): NextResponse {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: error.issues[0].message || defaultMessage },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }

  // Handle unknown error types
  return NextResponse.json(
    { error: defaultMessage },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

/**
 * Handles errors in route handlers with consistent error responses
 *
 * @param error - The error that occurred
 * @param context - Optional context information for logging
 * @returns NextResponse with error details
 */
export function handleRouteError(
  error: unknown,
  _context?: { route?: string; operation?: string }
): NextResponse {
  return createErrorResponse(error);
}
