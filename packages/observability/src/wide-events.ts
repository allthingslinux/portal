/**
 * Wide Events (Canonical Log Lines) Utilities
 *
 * Implements the wide events pattern: emit one context-rich event per request per service.
 * Instead of scattering log lines throughout handlers, consolidate everything into a single
 * structured event emitted at request completion.
 *
 * @see https://stripe.com/blog/canonical-log-lines
 * @see https://loggingsucks.com
 */

import "server-only";

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

import { log } from "./utils";

/**
 * Wide event structure for request logging
 * High cardinality (request_id, user_id) and high dimensionality (many fields)
 */
export interface WideEvent extends Record<string, unknown> {
  // Request identification (high cardinality)
  request_id: string;
  timestamp: string;

  // HTTP request context
  method: string;
  path: string;
  pathname?: string;
  search?: string;
  user_agent?: string;
  ip?: string;

  // Response context
  status_code?: number;
  outcome?: "success" | "error";
  duration_ms?: number;

  // Error context (if applicable)
  error?: {
    type: string;
    message: string;
    stack?: string;
  };

  // Business context (enriched by handlers)
  user?: {
    id: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  };

  // Additional context (enriched by handlers)
  [key: string]: unknown;
}

/**
 * Create a new wide event initialized with request context
 */
export function createWideEvent(request: NextRequest): WideEvent {
  const url = new URL(request.url);
  const requestId =
    request.headers.get("x-request-id") ||
    request.headers.get("x-correlation-id") ||
    randomUUID();

  return {
    request_id: requestId,
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.url,
    pathname: url.pathname,
    search: url.search || undefined,
    user_agent: request.headers.get("user-agent") || undefined,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined,
  };
}

/**
 * Enrich wide event with user context
 */
export function enrichWideEventWithUser(
  event: WideEvent,
  user: {
    id: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  }
): void {
  event.user = {
    id: user.id,
    ...(user.email && { email: user.email }),
    ...(user.role && { role: user.role }),
    ...Object.fromEntries(
      Object.entries(user).filter(
        ([key]) => !["id", "email", "role"].includes(key)
      )
    ),
  };
}

/**
 * Enrich wide event with error context
 */
export function enrichWideEventWithError(
  event: WideEvent,
  error: unknown
): void {
  if (error instanceof Error) {
    event.error = {
      type: error.name,
      message: error.message,
      ...(error.stack && { stack: error.stack }),
    };
  } else {
    event.error = {
      type: "UnknownError",
      message: String(error),
    };
  }
  event.outcome = "error";
}

/**
 * Emit wide event as a single structured log entry
 * This should be called once per request in a finally block
 */
export function emitWideEvent(event: WideEvent): void {
  // Ensure duration is calculated if not already set
  if (!event.duration_ms && event.timestamp) {
    const startTime = new Date(event.timestamp).getTime();
    event.duration_ms = Date.now() - startTime;
  }

  // Determine log level based on outcome
  if (
    event.outcome === "error" ||
    (event.status_code && event.status_code >= 500)
  ) {
    log.error("Request completed", event);
  } else if (event.status_code && event.status_code >= 400) {
    log.warn("Request completed", event);
  } else {
    log.info("Request completed", event);
  }
}

/**
 * Helper to wrap a route handler with wide event logging
 *
 * @example
 * ```ts
 * export const GET = withWideEvent(async (request, event) => {
 *   const { userId } = await requireAuth(request);
 *   event.user = { id: userId };
 *
 *   const data = await getData(userId);
 *   event.data_count = data.length;
 *
 *   return Response.json({ data });
 * });
 * ```
 */
export function withWideEvent<T extends NextRequest>(
  handler: (request: T, event: WideEvent) => Promise<Response> | Response
): (request: T) => Promise<Response> {
  return async (request: T): Promise<Response> => {
    const startTime = Date.now();
    const event = createWideEvent(request);

    try {
      const response = await handler(request, event);

      // Capture response status
      event.status_code = response.status;
      event.outcome = response.status < 400 ? "success" : "error";

      return response;
    } catch (error) {
      enrichWideEventWithError(event, error);
      event.status_code = 500;
      throw error;
    } finally {
      event.duration_ms = Date.now() - startTime;
      emitWideEvent(event);
    }
  };
}
