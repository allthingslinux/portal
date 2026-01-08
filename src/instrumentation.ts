import "server-only";

import { keys } from "@/lib/observability/keys";

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
  // For example, OpenTelemetry, custom logging, etc.

  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js specific instrumentation
    // Example: await import('./instrumentation-node')
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime specific instrumentation
    // Example: await import('./instrumentation-edge')
  }
}

/**
 * Called when the Next.js server captures an error.
 * Uses Sentry's built-in captureRequestError for better integration.
 */
export const onRequestError = async (
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
  const env = keys();
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  // Use Sentry's built-in captureRequestError for better integration
  const { captureRequestError } = await import("@sentry/nextjs");

  // Create a RequestInfo-compatible object
  const requestInfo = {
    path: request.path || "/",
    method: request.method || "GET",
    headers: request.headers,
  };

  // biome-ignore lint/suspicious/noExplicitAny: Sentry API compatibility requires any types
  captureRequestError(error, requestInfo as any, context as any);
};
