/**
 * Metrics utilities for tracking application performance and business metrics
 */

interface MetricAttributes {
  [key: string]: string | number | boolean;
}

interface MetricOptions {
  attributes?: MetricAttributes;
  unit?: string;
}

/**
 * Increment a counter metric
 */
export const incrementCounter = (
  name: string,
  value = 1,
  options?: MetricOptions
): void => {
  try {
    const { metrics } = require("@sentry/nextjs");
    metrics.count(name, value, options);
  } catch {
    // Sentry not available or metrics disabled
  }
};

/**
 * Set a gauge metric (value that can go up/down)
 */
export const setGauge = (
  name: string,
  value: number,
  options?: MetricOptions
): void => {
  try {
    const { metrics } = require("@sentry/nextjs");
    metrics.gauge(name, value, options);
  } catch {
    // Sentry not available or metrics disabled
  }
};

/**
 * Record a distribution metric (for timing, sizes, etc.)
 */
export const recordDistribution = (
  name: string,
  value: number,
  options?: MetricOptions
): void => {
  try {
    const { metrics } = require("@sentry/nextjs");
    metrics.distribution(name, value, options);
  } catch {
    // Sentry not available or metrics disabled
  }
};

/**
 * Common Portal metrics
 */
export const portalMetrics = {
  // User activity metrics
  userAction: (action: string, userId?: string) =>
    incrementCounter("user.action", 1, {
      attributes: { action, ...(userId && { user_id: userId }) },
    }),

  // API performance metrics
  apiRequest: (
    endpoint: string,
    method: string,
    duration: number,
    status: number
  ) => {
    incrementCounter("api.request", 1, {
      attributes: { endpoint, method, status: status.toString() },
    });
    recordDistribution("api.duration", duration, {
      attributes: { endpoint, method },
      unit: "millisecond",
    });
  },

  // Database metrics
  dbQuery: (
    table: string,
    operation: string,
    duration: number,
    rows?: number
  ) => {
    incrementCounter("db.query", 1, {
      attributes: { table, operation },
    });
    recordDistribution("db.duration", duration, {
      attributes: { table, operation },
      unit: "millisecond",
    });
    if (rows !== undefined) {
      recordDistribution("db.rows", rows, {
        attributes: { table, operation },
      });
    }
  },

  // Cache metrics
  cacheOperation: (operation: "hit" | "miss" | "set", key: string) =>
    incrementCounter(`cache.${operation}`, 1, {
      attributes: { cache_key: key },
    }),

  // Auth metrics
  authEvent: (
    event: "login" | "logout" | "signup" | "failed_login",
    provider?: string
  ) =>
    incrementCounter("auth.event", 1, {
      attributes: { event, ...(provider && { provider }) },
    }),

  // Business metrics
  businessEvent: (
    event: string,
    value?: number,
    attributes?: MetricAttributes
  ) => {
    incrementCounter("business.event", 1, {
      attributes: { event, ...attributes },
    });
    if (value !== undefined) {
      recordDistribution("business.value", value, {
        attributes: { event, ...attributes },
      });
    }
  },

  // System metrics
  systemMetric: (metric: string, value: number, unit?: string) =>
    setGauge(`system.${metric}`, value, { unit }),
};
