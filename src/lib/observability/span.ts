/**
 * Span metrics utilities for consistent performance tracking
 */

interface SpanAttributes {
  [key: string]: string | number | boolean | (string | number | boolean)[];
}

/**
 * Add metrics to the currently active span
 */
export const addSpanMetrics = (attributes: SpanAttributes): void => {
  try {
    const { getActiveSpan } = require("@sentry/nextjs");
    const span = getActiveSpan();

    if (span) {
      span.setAttributes(attributes);
    }
  } catch {
    // Sentry not available, ignore
  }
};

/**
 * Create a dedicated span with custom metrics (auto-ending)
 */
export const createMetricSpan = <T>(
  name: string,
  op: string,
  attributes: SpanAttributes,
  fn: () => T
): T => {
  try {
    const { startSpan } = require("@sentry/nextjs");
    return startSpan({ name, op, attributes }, fn);
  } catch {
    // Sentry not available, execute function directly
    return fn();
  }
};

/**
 * Create a manual span that must be ended explicitly
 */
export const createManualSpan = (
  name: string,
  op: string,
  attributes?: SpanAttributes
) => {
  try {
    const { startInactiveSpan } = require("@sentry/nextjs");
    return startInactiveSpan({ name, op, attributes });
  } catch {
    // Return mock span if Sentry not available
    return {
      setAttribute: () => {
        // Mock implementation
      },
      setAttributes: () => {
        // Mock implementation
      },
      setStatus: () => {
        // Mock implementation
      },
      end: () => {
        // Mock implementation
      },
    };
  }
};

interface Span {
  setAttribute: (key: string, value: unknown) => void;
  setAttributes: (attributes: Record<string, unknown>) => void;
  setStatus: (status: { code: number; message: string }) => void;
  end: () => void;
  updateName?: (name: string) => void;
}

/**
 * Update span name (recommended over span.updateName)
 */
export const updateSpanName = (span: Span, name: string): void => {
  try {
    const { updateSpanName } = require("@sentry/nextjs");
    updateSpanName(span, name);
  } catch {
    // Fallback to direct method
    span?.updateName?.(name);
  }
};

/**
 * Common span metrics for Portal operations
 */
export const spanMetrics = {
  database: (
    operation: string,
    table: string,
    duration: number,
    rows?: number
  ) => ({
    "db.operation": operation,
    "db.table": table,
    "db.duration_ms": duration,
    ...(rows !== undefined && { "db.rows_affected": rows }),
  }),

  api: (
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) => ({
    "http.endpoint": endpoint,
    "http.method": method,
    "http.duration_ms": duration,
    "http.status_code": status,
  }),

  auth: (
    operation: string,
    provider: string,
    duration: number,
    success: boolean
  ) => ({
    "auth.operation": operation,
    "auth.provider": provider,
    "auth.duration_ms": duration,
    "auth.success": success,
  }),
};
