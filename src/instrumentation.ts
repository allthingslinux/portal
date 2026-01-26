import "server-only";

import { captureException, captureRequestError } from "@sentry/nextjs";

import { keys } from "@/shared/observability/keys";

/**
 * Next.js instrumentation hook
 * This file is used to integrate observability tools into your application.
 *
 * For Sentry-specific initialization, see:
 * - sentry.server.config.ts (Node.js runtime)
 * - sentry.edge.config.ts (Edge runtime)
 */

/**
 * Called once when a new Next.js server instance is initiated.
 * Use this for general instrumentation (OpenTelemetry, custom logging, etc.)
 */
export function register() {
  // Runtime-specific instrumentation can be added here
  // Note: Sentry's globalHandlersIntegration automatically handles:
  // - unhandledRejection (promise rejections)
  // - uncaughtException (synchronous errors)
  // Manual handlers are not needed and would cause double-reporting

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js specific instrumentation
    // Additional instrumentation can be added here if needed
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime specific instrumentation
  }
}

/**
 * Called when the Next.js server captures an error.
 * Uses Sentry's built-in captureRequestError for better integration.
 */
// Cache env keys result to avoid recomputing on every error
let cachedEnv: ReturnType<typeof keys> | null = null;
const getCachedEnv = () => {
  if (!cachedEnv) {
    cachedEnv = keys();
  }
  return cachedEnv;
};

/**
 * Called when the Next.js server captures an error during request handling.
 * This includes errors from:
 * - Route handlers (API routes)
 * - Server Components
 * - Server Actions
 * - Middleware
 *
 * Uses Sentry's built-in captureRequestError for proper integration with Next.js.
 */
export const onRequestError = (
  error: unknown,
  request: {
    path: string;
    method: string;
    headers?: Record<string, string | string[] | undefined>;
  },
  context: {
    routerKind: string;
    routeType: string;
    renderSource?: string;
    routePath?: string;
    revalidateReason?: string;
  }
) => {
  // Only capture if Sentry is configured
  const env = getCachedEnv();
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  try {
    // Use Sentry's built-in captureRequestError for better integration
    // This automatically includes request context, user info, and breadcrumbs
    // Ensure headers is always defined to match RequestInfo type
    const requestInfo = {
      path: request.path || "/",
      method: request.method || "GET",
      headers: request.headers ?? {},
    };
    // Ensure all required ErrorContext fields are present
    const errorContext = {
      routerKind: context.routerKind,
      routeType: context.routeType,
      renderSource: context.renderSource,
      routePath: context.routePath ?? request.path ?? "/",
      revalidateReason: context.revalidateReason,
    };
    captureRequestError(error, requestInfo, errorContext);
  } catch (sentryError) {
    // Fallback: if captureRequestError fails, try direct captureException
    try {
      captureException(error, {
        tags: {
          type: "request_error",
          path: request.path || "/",
          method: request.method || "GET",
          routerKind: context.routerKind,
          routeType: context.routeType,
        },
        extra: {
          request,
          context,
        },
      });
    } catch {
      // Sentry not available or failed to capture
      // eslint-disable-next-line no-console
      console.error("Failed to capture error to Sentry:", sentryError);
      // eslint-disable-next-line no-console
      console.error("Original error:", error);
    }
  }
};
