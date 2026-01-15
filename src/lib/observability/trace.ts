/**
 * Manual trace propagation utilities for custom scenarios
 */

/**
 * Get trace data for manual propagation (WebSockets, job queues, etc.)
 */
export const getTraceHeaders = (): {
  "sentry-trace"?: string;
  baggage?: string;
} => {
  try {
    const { getTraceData } = require("@sentry/nextjs");
    return getTraceData();
  } catch {
    return {};
  }
};

/**
 * Continue a trace from incoming headers
 */
export const continueTrace = <T>(
  headers: { "sentry-trace"?: string; baggage?: string },
  callback: () => T
): T => {
  try {
    const { continueTrace } = require("@sentry/nextjs");
    return continueTrace(
      {
        sentryTrace: headers["sentry-trace"],
        baggage: headers.baggage,
      },
      callback
    );
  } catch {
    return callback();
  }
};

/**
 * Start a new isolated trace
 */
export const startNewTrace = <T>(callback: () => T): T => {
  try {
    const { startNewTrace } = require("@sentry/nextjs");
    return startNewTrace(callback);
  } catch {
    return callback();
  }
};
