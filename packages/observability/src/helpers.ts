/**
 * Advanced observability helpers
 * Consolidated utilities for instrumentation, context management, metrics, and tracing
 * These are optional utilities that can be imported when needed
 */

// ============================================================================
// Context & Enrichment
// ============================================================================

interface PortalUserContext {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  subscription?: string;
  tenant?: string;
}

interface PortalEventContext {
  feature?: string;
  component?: string;
  action?: string;
  route?: string;
  userAgent?: string;
  viewport?: string;
}

/**
 * Set user context with Portal-specific data
 */
export const setPortalUser = (user: PortalUserContext): void => {
  try {
    const { setUser, setTag } = require("@sentry/nextjs");
    setUser({
      id: user.id,
      email: user.email, // Will be filtered out by beforeSend
      username: user.username,
    });
    if (user.role) {
      setTag("user.role", user.role);
    }
    if (user.subscription) {
      setTag("user.subscription", user.subscription);
    }
    if (user.tenant) {
      setTag("user.tenant", user.tenant);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Set Portal-specific tags for business context
 */
export const setPortalTags = (tags: Record<string, string>): void => {
  try {
    const { setTag } = require("@sentry/nextjs");
    for (const [key, value] of Object.entries(tags)) {
      setTag(`portal.${key}`, value);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Set feature-specific context
 */
export const setFeatureContext = (context: PortalEventContext): void => {
  try {
    const { setContext, setTag } = require("@sentry/nextjs");
    setContext("portal_feature", {
      feature: context.feature,
      component: context.component,
      action: context.action,
      route: context.route,
      timestamp: new Date().toISOString(),
    });
    if (context.feature) {
      setTag("portal.feature", context.feature);
    }
    if (context.component) {
      setTag("portal.component", context.component);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Set browser/device context (client-side only)
 */
export const setBrowserContext = (): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const { setContext } = require("@sentry/nextjs");
    setContext("browser_info", {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Set deployment context
 */
export const setDeploymentContext = (): void => {
  try {
    const { setContext, setTag } = require("@sentry/nextjs");
    setContext("deployment", {
      buildId: process.env.BUILD_ID,
      gitHash: process.env.GIT_HASH,
      deployTime: process.env.DEPLOY_TIME,
      region: process.env.VERCEL_REGION || process.env.AWS_REGION,
    });
    const region = process.env.VERCEL_REGION || process.env.AWS_REGION;
    if (region) {
      setTag("deployment.region", region);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Comprehensive Portal context setup
 */
export const initializePortalContext = (user?: PortalUserContext): void => {
  if (user) {
    setPortalUser(user);
  }
  setBrowserContext();
  setDeploymentContext();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "server";
  setPortalTags({ service: "portal", domain: hostname });
};

/**
 * Add breadcrumb for user actions
 */
export const addActionBreadcrumb = (
  action: string,
  category = "user",
  data?: Record<string, unknown>
): void => {
  try {
    const { addBreadcrumb } = require("@sentry/nextjs");
    addBreadcrumb({
      message: action,
      category: `portal.${category}`,
      level: "info",
      data: { timestamp: new Date().toISOString(), ...data },
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Set data on global scope (applies to all events)
 */
export const setGlobalData = (data: {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  context?: Record<string, unknown>;
}): void => {
  try {
    const { getGlobalScope } = require("@sentry/nextjs");
    const scope = getGlobalScope();
    if (data.tags) {
      for (const [key, value] of Object.entries(data.tags)) {
        scope.setTag(key, value);
      }
    }
    if (data.extra) {
      scope.setExtras(data.extra);
    }
    if (data.context) {
      for (const [key, value] of Object.entries(data.context)) {
        scope.setContext(key, value);
      }
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Execute function with isolated scope
 */
export const withIsolatedScope = <T>(
  data: {
    user?: { id: string; email?: string; [key: string]: unknown };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
  fn: () => T
): T => {
  try {
    const {
      withIsolationScope,
      setUser,
      setTag,
      setExtras,
    } = require("@sentry/nextjs");
    return withIsolationScope(() => {
      if (data.user) {
        setUser(data.user);
      }
      if (data.tags) {
        for (const [key, value] of Object.entries(data.tags)) {
          setTag(key, value);
        }
      }
      if (data.extra) {
        setExtras(data.extra);
      }
      return fn();
    });
  } catch {
    return fn();
  }
};

/**
 * Execute function with local scope
 */
export const withLocalScope = <T>(
  data: {
    level?: "fatal" | "error" | "warning" | "log" | "info" | "debug";
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    context?: Record<string, unknown>;
  },
  fn: () => T
): T => {
  try {
    const { withScope } = require("@sentry/nextjs");
    return withScope(
      (scope: {
        setLevel?: (level: string) => void;
        setTag: (key: string, value: string) => void;
        setExtras: (extras: Record<string, unknown>) => void;
        setContext: (key: string, value: unknown) => void;
      }) => {
        if (data.level) {
          scope.setLevel?.(data.level);
        }
        if (data.tags) {
          for (const [key, value] of Object.entries(data.tags)) {
            scope.setTag(key, value);
          }
        }
        if (data.extra) {
          scope.setExtras(data.extra);
        }
        if (data.context) {
          for (const [key, value] of Object.entries(data.context)) {
            scope.setContext(key, value);
          }
        }
        return fn();
      }
    );
  } catch {
    return fn();
  }
};

/**
 * Common scope patterns for Portal
 */
export const scopePatterns = {
  userContext: <T>(
    user: { id: string; email?: string; tier?: string },
    fn: () => T
  ): T => withIsolatedScope({ user }, fn),

  apiContext: <T>(
    endpoint: string,
    method: string,
    fn: () => T,
    userId?: string
  ): T =>
    withLocalScope(
      {
        tags: { endpoint, method, ...(userId && { user_id: userId }) },
        context: { api: { endpoint, method } },
      },
      fn
    ),

  jobContext: <T>(jobName: string, jobId: string, fn: () => T): T =>
    withIsolatedScope(
      {
        tags: { job_name: jobName, job_id: jobId },
        extra: { job: { name: jobName, id: jobId } },
      },
      fn
    ),
};

// ============================================================================
// Cache Instrumentation
// ============================================================================

interface CacheOptions {
  key: string | string[];
  address?: string;
  port?: number;
}

interface CacheSetOptions extends CacheOptions {
  itemSize?: number;
}

interface CacheGetOptions extends CacheOptions {
  hit?: boolean;
  itemSize?: number;
}

const normalizeKey = (key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key];
  return { primaryKey: keys[0], keys };
};

const baseCacheAttributes = (options: CacheOptions) => {
  const { keys } = normalizeKey(options.key);
  return {
    "cache.key": keys,
    ...(options.address && { "network.peer.address": options.address }),
    ...(options.port && { "network.peer.port": options.port }),
  };
};

/**
 * Instrument cache set operations
 */
export const instrumentCacheSet = async <T>(
  options: CacheSetOptions,
  setter: () => Promise<T> | T
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");
    const { primaryKey } = normalizeKey(options.key);
    return await startSpan(
      {
        name: `cache.set ${primaryKey}`,
        op: "cache.put",
        attributes: {
          ...baseCacheAttributes(options),
          ...(options.itemSize && { "cache.item_size": options.itemSize }),
        },
      },
      setter
    );
  } catch {
    return await setter();
  }
};

/**
 * Instrument cache get operations
 */
export const instrumentCacheGet = async <T>(
  options: CacheGetOptions,
  getter: () => Promise<T> | T
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");
    const { primaryKey } = normalizeKey(options.key);
    return await startSpan(
      {
        name: `cache.get ${primaryKey}`,
        op: "cache.get",
        attributes: baseCacheAttributes(options),
      },
      async (span: { setAttribute: (key: string, value: unknown) => void }) => {
        const result = await getter();
        const hit = options.hit ?? result !== undefined;
        span.setAttribute("cache.hit", hit);
        if (hit && options.itemSize) {
          span.setAttribute("cache.item_size", options.itemSize);
        }
        return result;
      }
    );
  } catch {
    return await getter();
  }
};

/**
 * Calculate item size for common data types
 */
export const calculateCacheItemSize = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "string") {
    return value.length;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }
  return String(value).length;
};

/**
 * Common cache configurations
 */
export const cacheConfigs = {
  redis: (host = "localhost", port = 6379) => ({ address: host, port }),
  memory: () => ({ address: "in-memory" }),
  nextjs: () => ({ address: "next-cache" }),
};

// ============================================================================
// Queue Instrumentation
// ============================================================================

interface TraceHeaders {
  "sentry-trace"?: string;
  baggage?: string;
}

interface QueueMessage {
  id: string;
  body: unknown;
  timestamp: number;
  retryCount?: number;
}

interface QueueProducerOptions {
  messageId: string;
  queueName: string;
  messageSize: number;
}

interface QueueConsumerOptions {
  messageId: string;
  queueName: string;
  messageSize: number;
  retryCount?: number;
  receiveLatency?: number;
}

const buildQueueConsumerAttributes = (options: QueueConsumerOptions) => ({
  "messaging.message.id": options.messageId,
  "messaging.destination.name": options.queueName,
  "messaging.message.body.size": options.messageSize,
  ...(options.retryCount !== undefined && {
    "messaging.message.retry.count": options.retryCount,
  }),
  ...(options.receiveLatency !== undefined && {
    "messaging.message.receive.latency": options.receiveLatency,
  }),
});

/**
 * Instrument queue message publishing
 */
export const instrumentQueueProducer = async <T>(
  options: QueueProducerOptions,
  producer: (traceHeaders: TraceHeaders) => Promise<T>
): Promise<T> => {
  try {
    const { startSpan, getTraceData } = require("@sentry/nextjs");
    return await startSpan(
      {
        name: "queue_producer",
        op: "queue.publish",
        attributes: {
          "messaging.message.id": options.messageId,
          "messaging.destination.name": options.queueName,
          "messaging.message.body.size": options.messageSize,
        },
      },
      async () => {
        const traceHeaders = getTraceData();
        return await producer(traceHeaders);
      }
    );
  } catch {
    return await producer({});
  }
};

/**
 * Instrument queue message consumption
 */
export const instrumentQueueConsumer = async <T>(
  options: QueueConsumerOptions,
  traceHeaders: TraceHeaders,
  consumer: () => Promise<T>
): Promise<T> => {
  let consumerExecuted = false;
  try {
    const { continueTrace, startSpan } = require("@sentry/nextjs");
    return await continueTrace(
      {
        sentryTrace: traceHeaders["sentry-trace"],
        baggage: traceHeaders.baggage,
      },
      async () => {
        return await startSpan(
          { name: "queue_consumer_transaction" },
          async (parent: {
            setStatus?: (status: { code: number; message: string }) => void;
          }) => {
            try {
              const result = await startSpan(
                {
                  name: "queue_consumer",
                  op: "queue.process",
                  attributes: buildQueueConsumerAttributes(options),
                },
                () => {
                  consumerExecuted = true;
                  return consumer();
                }
              );
              parent.setStatus?.({ code: 1, message: "ok" });
              return result;
            } catch (error) {
              parent.setStatus?.({ code: 2, message: "error" });
              throw error;
            }
          }
        );
      }
    );
  } catch (error) {
    if (!consumerExecuted) {
      return await consumer();
    }
    throw error;
  }
};

/**
 * Create queue message with trace headers
 */
export const createQueueMessage = (
  id: string,
  body: unknown,
  traceHeaders: TraceHeaders
): QueueMessage & { sentryTrace?: string; sentryBaggage?: string } => ({
  id,
  body,
  timestamp: Date.now(),
  sentryTrace: traceHeaders["sentry-trace"],
  sentryBaggage: traceHeaders.baggage,
});

/**
 * Calculate receive latency
 */
export const calculateReceiveLatency = (message: QueueMessage): number =>
  Date.now() - message.timestamp;

// ============================================================================
// HTTP Instrumentation
// ============================================================================

interface HttpRequestOptions {
  method: string;
  url: string;
  requestSize?: number;
}

const calculateBodySize = (body: unknown): number | undefined => {
  try {
    return JSON.stringify(body).length;
  } catch {
    return undefined;
  }
};

const buildHttpOptions = (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: unknown
): HttpRequestOptions => ({
  method,
  url,
  ...(body !== undefined && { requestSize: calculateBodySize(body) }),
});

/**
 * Instrument HTTP requests for custom clients
 */
export const instrumentHttpRequest = async <T>(
  options: HttpRequestOptions,
  requester: () => Promise<T>
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");
    return await startSpan(
      {
        op: "http.client",
        name: `${options.method} ${options.url}`,
        attributes: {
          "http.request.method": options.method,
          ...(options.requestSize && {
            "http.request.body.size": options.requestSize,
          }),
        },
      },
      async (span: {
        setAttribute: (key: string, value: unknown) => void;
        setStatus: (status: { code: number; message: string }) => void;
      }) => {
        try {
          const parsedURL = new URL(
            options.url,
            typeof window !== "undefined" ? window.location.origin : undefined
          );
          span.setAttribute("server.address", parsedURL.hostname);
          if (parsedURL.port) {
            span.setAttribute("server.port", Number(parsedURL.port));
          }
          const result = await requester();
          if (result && typeof result === "object" && "status" in result) {
            const response = result as {
              status: number;
              headers?: { get?: (name: string) => string | null };
            };
            span.setAttribute("http.response.status_code", response.status);
            if (response.headers?.get) {
              const contentLength = response.headers.get("content-length");
              if (contentLength) {
                span.setAttribute(
                  "http.response.body.size",
                  Number(contentLength)
                );
              }
            }
          }
          return result;
        } catch (error) {
          span.setStatus({ code: 2, message: "error" });
          throw error;
        }
      }
    );
  } catch {
    return await requester();
  }
};

/**
 * HTTP client with automatic Sentry instrumentation
 */
export const httpClient = {
  get: <T>(url: string, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("GET", url), fetcher),

  post: <T>(url: string, body: unknown, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("POST", url, body), fetcher),

  put: <T>(url: string, body: unknown, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("PUT", url, body), fetcher),

  delete: <T>(url: string, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("DELETE", url), fetcher),
};

// ============================================================================
// Span Utilities
// ============================================================================

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
    // Sentry not available
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
 * Update span name
 */
export const updateSpanName = (span: Span, name: string): void => {
  try {
    const { updateSpanName } = require("@sentry/nextjs");
    updateSpanName(span, name);
  } catch {
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

// ============================================================================
// Trace Propagation
// ============================================================================

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

// ============================================================================
// Metrics
// ============================================================================

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
    // Sentry not available
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
    // Sentry not available
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
    // Sentry not available
  }
};

/**
 * Common Portal metrics
 */
export const portalMetrics = {
  userAction: (action: string, userId?: string) =>
    incrementCounter("user.action", 1, {
      attributes: { action, ...(userId && { user_id: userId }) },
    }),

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

  cacheOperation: (operation: "hit" | "miss" | "set", key: string) =>
    incrementCounter(`cache.${operation}`, 1, {
      attributes: { cache_key: key },
    }),

  authEvent: (
    event: "login" | "logout" | "signup" | "failed_login",
    provider?: string
  ) =>
    incrementCounter("auth.event", 1, {
      attributes: { event, ...(provider && { provider }) },
    }),

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

  systemMetric: (metric: string, value: number, unit?: string) =>
    setGauge(`system.${metric}`, value, { unit }),
};

// ============================================================================
// Event Levels
// ============================================================================

type SentryLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

/**
 * Set level for current scope
 */
export const setLevel = (level: SentryLevel): void => {
  try {
    const { getCurrentScope } = require("@sentry/nextjs");
    getCurrentScope().setLevel(level);
  } catch {
    // Sentry not available
  }
};

/**
 * Capture message with specific level
 */
export const captureMessageWithLevel = (
  message: string,
  level: SentryLevel
): void => {
  try {
    const { captureMessage } = require("@sentry/nextjs");
    captureMessage(message, level);
  } catch {
    // Sentry not available
  }
};

/**
 * Capture exception with specific level
 */
export const captureExceptionWithLevel = (
  error: unknown,
  level: SentryLevel
): void => {
  try {
    const { withScope, captureException } = require("@sentry/nextjs");
    withScope((scope: { setLevel: (level: string) => void }) => {
      scope.setLevel(level);
      captureException(error);
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Common level patterns for Portal
 */
export const levelPatterns = {
  fatal: (error: unknown) => captureExceptionWithLevel(error, "fatal"),
  error: (error: unknown) => captureExceptionWithLevel(error, "error"),
  warning: (message: string) => captureMessageWithLevel(message, "warning"),
  info: (message: string) => captureMessageWithLevel(message, "info"),
  debug: (message: string) => captureMessageWithLevel(message, "debug"),
};
