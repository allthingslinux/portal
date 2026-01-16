/*
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import {
  consoleLoggingIntegration,
  extraErrorDataIntegration,
  httpClientIntegration,
  init,
  replayIntegration,
  reportingObserverIntegration,
  zodErrorsIntegration,
} from "@sentry/nextjs";

import { keys } from "./keys";

// Common regex patterns for client filtering
const API_ROUTE_REGEX = /^\/api\//;
const ATL_DOMAINS_REGEX = /^https:\/\/.*\.atl\.(dev|sh|tools|chat)\//;
const HEALTH_METRICS_REGEX = /\/(health|metrics|favicon|_next\/static)\/?/;
const FB_FRAGMENT_REGEX = /fb_xd_fragment/;
const GOOGLE_REGEX = /google/i;
const GSTATIC_REGEX = /gstatic/i;
const STATIC_ASSETS_REGEX = /^\/_next\/static\//;
const FAVICON_REGEX = /^\/favicon/;
const HEALTH_REGEX = /^\/health/;
const API_HEALTH_REGEX = /^\/api\/health/;
const MONITORING_REGEX = /^\/monitoring/;
const LOCALHOST_REGEX = /^https?:\/\/localhost/;
const ATL_DOMAINS_ALLOW_REGEX = /^https?:\/\/.*\.atl\.(dev|sh|tools|chat)/;
const RELATIVE_URL_REGEX = /^\//;
const ATL_DEV_REGEX = /^https:\/\/.*\.atl\.dev$/;
const ATL_SH_REGEX = /^https:\/\/.*\.atl\.sh$/;
const ATL_TOOLS_REGEX = /^https:\/\/.*\.atl\.tools$/;
const ATL_CHAT_REGEX = /^https:\/\/.*\.atl\.chat$/;
const TRAILING_SLASH_REGEX = /\/$/;

const getReplayIntegration = () => {
  // replayIntegration is only available client-side
  if (typeof window === "undefined") {
    return null;
  }

  return replayIntegration({
    maskAllText: true,
    blockAllMedia: true,
  });
};

// ============================================================================
// Transaction Sanitization
// ============================================================================

/**
 * Sanitize transaction names by replacing dynamic segments
 */
const sanitizeTransactionName = (transactionName?: string): string => {
  if (!transactionName) {
    return "unknown";
  }

  return (
    transactionName
      // Replace UUIDs with placeholder
      .replace(
        /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi,
        "/<uuid>"
      )
      // Replace hash-like strings
      .replace(/\/[0-9a-fA-F]{32,}/gi, "/<hash>")
      // Replace numeric IDs
      .replace(/\/\d+/g, "/<id>")
      // Replace email addresses
      .replace(/\/[^/]+@[^/]+\.[^/]+/g, "/<email>")
      // Replace base64 tokens
      .replace(/\/[A-Za-z0-9+/=]{40,}/g, "/<token>")
      // Replace hex tokens
      .replace(/\/[0-9a-fA-F]{32,}/gi, "/<token>")
      // Clean up multiple slashes
      .replace(/\/+/g, "/")
      // Remove trailing slash
      .replace(TRAILING_SLASH_REGEX, "")
  );
};

/**
 * Initialize transaction name sanitization
 */
const initializeTransactionSanitization = (): void => {
  try {
    const { addEventProcessor } = require("@sentry/nextjs");
    addEventProcessor((event: { transaction?: string; type?: string }) => {
      if (event.type === "transaction" && event.transaction) {
        event.transaction = sanitizeTransactionName(event.transaction);
      }
      return event;
    });
  } catch {
    // Sentry not available
  }
};

// ============================================================================
// Error Fingerprinting
// ============================================================================

interface SentryEvent {
  fingerprint?: string[];
  transaction?: string;
  type?: string;
  [key: string]: unknown;
}

interface SentryHint {
  originalException?: {
    name?: string;
    statusCode?: number;
    status?: number;
    endpoint?: string;
    url?: string;
    method?: string;
    operation?: string;
    table?: string;
    model?: string;
    provider?: string;
    type?: string;
    code?: string;
    field?: string;
    path?: string;
    rule?: string;
    constraint?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Process API error fingerprinting
 */
const processApiError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (exception?.name === "ApiError" || exception?.statusCode) {
    const endpoint = exception.endpoint || exception.url || "unknown";
    const method = exception.method || "unknown";
    const statusCode = exception.statusCode || exception.status || 0;
    event.fingerprint = ["api-error", endpoint, method, String(statusCode)];
    return true;
  }
  return false;
};

/**
 * Process database error fingerprinting
 */
const processDatabaseError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (
    exception?.name?.includes("Database") ||
    exception?.code?.startsWith("P")
  ) {
    const operation = exception.operation || "unknown";
    const table = exception.table || exception.model || "unknown";
    event.fingerprint = ["database-error", operation, table];
    return true;
  }
  return false;
};

/**
 * Process auth error fingerprinting
 */
const processAuthError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (exception?.name?.includes("Auth") || exception?.provider) {
    const provider = exception.provider || "unknown";
    const errorType = exception.type || exception.code || "unknown";
    event.fingerprint = ["auth-error", provider, errorType];
    return true;
  }
  return false;
};

/**
 * Process validation error fingerprinting
 */
const processValidationError = (
  event: SentryEvent,
  exception: SentryHint["originalException"]
): boolean => {
  if (exception?.name?.includes("Validation") || exception?.field) {
    const field = exception.field || exception.path || "unknown";
    const rule = exception.rule || exception.constraint || "unknown";
    event.fingerprint = ["validation-error", field, rule];
    return true;
  }
  return false;
};

/**
 * Initialize fingerprinting in beforeSend hook
 */
const initializeFingerprinting = (): void => {
  try {
    const { addEventProcessor } = require("@sentry/nextjs");
    addEventProcessor((event: SentryEvent, hint: SentryHint) => {
      const exception = hint?.originalException;

      if (!(exception && event)) {
        return event;
      }

      // Try each error type processor
      if (processApiError(event, exception)) {
        return event;
      }
      if (processDatabaseError(event, exception)) {
        return event;
      }
      if (processAuthError(event, exception)) {
        return event;
      }
      if (processValidationError(event, exception)) {
        return event;
      }

      return event;
    });
  } catch {
    // Sentry not available
  }
};

// ============================================================================
// Sampling
// ============================================================================

interface SamplingContext {
  name: string;
  attributes?: Record<string, unknown>;
  parentSampled?: boolean;
  parentSampleRate?: number;
  inheritOrSampleWith: (fallbackRate: number) => number;
}

/**
 * Check if transaction should be skipped
 */
const shouldSkipTransaction = (name: string): boolean => {
  return name.includes("health") || name.includes("metrics");
};

/**
 * Check if transaction is critical auth flow
 */
const isCriticalAuthFlow = (name: string): boolean => {
  return (
    name.includes("auth") || name.includes("login") || name.includes("signup")
  );
};

/**
 * Get API route sampling rate
 */
const getApiRouteSamplingRate = (
  name: string,
  isProduction: boolean
): number | null => {
  if (name.includes("/api/")) {
    return isProduction ? 0.3 : 1;
  }
  return null;
};

/**
 * Get static asset sampling rate
 */
const getStaticAssetSamplingRate = (
  name: string,
  isProduction: boolean
): number | null => {
  if (name.includes("/_next/") || name.includes("/favicon")) {
    return isProduction ? 0.01 : 0.1;
  }
  return null;
};

/**
 * Get user tier sampling rate
 */
const getUserTierSamplingRate = (
  attributes: Record<string, unknown> | undefined,
  isProduction: boolean
): number | null => {
  if (attributes?.userTier === "premium") {
    return isProduction ? 0.5 : 1;
  }
  return null;
};

/**
 * Portal's intelligent sampling function
 */
const portalSampler = (isProduction: boolean) => {
  return (samplingContext: SamplingContext): number => {
    const { name, attributes, inheritOrSampleWith } = samplingContext;

    // Skip health checks and monitoring endpoints
    if (shouldSkipTransaction(name)) {
      return 0;
    }

    // Always sample auth flows (critical user experience)
    if (isCriticalAuthFlow(name)) {
      return 1;
    }

    // High sampling for API routes
    const apiRate = getApiRouteSamplingRate(name, isProduction);
    if (apiRate !== null) {
      return apiRate;
    }

    // Lower sampling for static assets
    const staticRate = getStaticAssetSamplingRate(name, isProduction);
    if (staticRate !== null) {
      return staticRate;
    }

    // Sample based on user tier if available
    const tierRate = getUserTierSamplingRate(attributes, isProduction);
    if (tierRate !== null) {
      return tierRate;
    }

    // Default rates based on environment
    return inheritOrSampleWith(isProduction ? 0.1 : 1);
  };
};

/**
 * Create beforeSend callback for filtering sensitive data
 */
const createBeforeSend = (isProduction: boolean) => {
  // biome-ignore lint/suspicious/noExplicitAny: Sentry callback types require any
  return (event: any, hint?: any) => {
    // Remove sensitive user data
    if (event?.user) {
      event.user.email = undefined;
      event.user.ip_address = undefined;
    }

    // Filter development-only errors in production
    if (
      isProduction &&
      hint?.originalException &&
      typeof hint.originalException === "object" &&
      hint.originalException !== null &&
      "message" in hint.originalException &&
      typeof hint.originalException.message === "string" &&
      hint.originalException.message.includes("HMR")
    ) {
      return null;
    }

    return event;
  };
};

/**
 * Filter transaction data
 */
// biome-ignore lint/suspicious/noExplicitAny: Sentry callback types require any
const beforeSendTransaction = (event: any) => {
  // Remove query parameters that might contain sensitive data
  if (event?.transaction) {
    event.transaction = event.transaction.split("?")[0];
  }
  return event;
};

/**
 * Create beforeBreadcrumb callback for filtering breadcrumbs
 */
const createBeforeBreadcrumb = (isProduction: boolean) => {
  // biome-ignore lint/suspicious/noExplicitAny: Sentry callback types require any
  return (breadcrumb: any): any => {
    // Skip console breadcrumbs in production
    if (isProduction && breadcrumb?.category === "console") {
      return null;
    }

    // Skip UI clicks on non-interactive elements
    if (
      breadcrumb?.category === "ui.click" &&
      breadcrumb?.message?.includes("div")
    ) {
      return null;
    }

    return breadcrumb;
  };
};

/**
 * Create tracesSampler callback
 */
const createTracesSampler = (isProduction: boolean) => {
  // biome-ignore lint/suspicious/noExplicitAny: Sentry callback types require any
  return (samplingContext: any) => {
    // Adapt Sentry's TracesSamplerContext to portalSampler's SamplingContext
    const adaptedContext = {
      name:
        samplingContext?.transactionContext?.name ||
        samplingContext?.name ||
        "",
      attributes: samplingContext?.transactionContext?.data,
      parentSampled: samplingContext?.parentSampled,
      parentSampleRate: samplingContext?.parentSampleRate,
      inheritOrSampleWith: (fallbackRate: number) => {
        if (samplingContext?.parentSampled !== undefined) {
          return samplingContext.parentSampled ? 1 : 0;
        }
        return Math.random() < fallbackRate ? 1 : 0;
      },
    };

    return portalSampler(isProduction)(adaptedContext);
  };
};

export const initializeSentry = (): ReturnType<typeof init> => {
  const env = keys();

  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return undefined as ReturnType<typeof init>;
  }

  // Environment-based sample rates
  const isProduction = process.env.NODE_ENV === "production";

  /**
   * Add client-only integrations (browser context)
   */
  const addClientIntegrations = (integrations: unknown[]) => {
    if (typeof window === "undefined") {
      return;
    }

    // HTTP client integration for fetch/XHR error tracking (client-side only)
    integrations.push(
      httpClientIntegration({
        failedRequestStatusCodes: [[400, 599]], // Track 4xx and 5xx errors
        failedRequestTargets: [
          API_ROUTE_REGEX, // Internal API routes
          ATL_DOMAINS_REGEX, // ATL domains
        ],
      })
    );

    // Reporting Observer for browser deprecations and crashes (client-side only)
    integrations.push(
      reportingObserverIntegration({
        types: ["crash", "deprecation", "intervention"],
      })
    );
  };

  /**
   * Add browser tracing integrations
   * These are conditionally imported as they may not be available in all environments
   */
  const addBrowserTracingIntegrations = (integrations: unknown[]) => {
    // Only add browser tracing in browser environment
    if (typeof window === "undefined") {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const {
        browserTracingIntegration,
        browserProfilingIntegration,
      } = require("@sentry/nextjs");

      if (browserTracingIntegration && browserProfilingIntegration) {
        integrations.push(
          browserTracingIntegration({
            // Filter out health checks and monitoring endpoints
            shouldCreateSpanForRequest: (url: string) => {
              return !url.match(HEALTH_METRICS_REGEX);
            },
            // Ignore noisy resource spans
            ignoreResourceSpans: ["resource.css", "resource.font"],
            // Enable INP tracking for performance insights
            enableInp: true,
          }),
          browserProfilingIntegration()
        );
      }
    } catch {
      // Browser tracing integrations not available, skip
    }
  };

  /**
   * Build integrations array with all required Sentry integrations
   */
  const buildIntegrations = () => {
    const integrations = [
      // Note: Global error handlers (window.onerror, unhandled rejections) are
      // enabled by default in Sentry's client-side SDK, so we don't need to
      // explicitly add globalHandlersIntegration here.

      consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),

      // Zod validation error enhancement
      zodErrorsIntegration({
        limit: 10, // Limit validation errors per event
      }),
    ];

    addClientIntegrations(integrations);

    // Add extra error data integration for richer error context
    integrations.push(
      extraErrorDataIntegration({
        depth: 5, // Capture deeper error object properties
        captureErrorCause: true, // Capture error.cause chains
      })
    );

    addBrowserTracingIntegrations(integrations);

    // Add replay integration at the beginning (important for initialization order)
    const replay = getReplayIntegration();
    if (replay) {
      integrations.unshift(replay);
    }

    return { integrations, replay };
  };

  const { integrations, replay } = buildIntegrations();

  // Initialize transaction name sanitization
  initializeTransactionSanitization();

  // Initialize event fingerprinting
  initializeFingerprinting();

  return init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    enableLogs: true,
    debug: false,
    // Environment and release info
    environment: process.env.NODE_ENV,
    // Use NEXT_PUBLIC_SENTRY_RELEASE for client-side, fallback to unknown
    release: env.NEXT_PUBLIC_SENTRY_RELEASE || "unknown",

    // Filter out common browser extension and third-party errors
    ignoreErrors: [
      // Browser extensions
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "Script error.",
      // Network errors that aren't actionable
      "NetworkError",
      "Failed to fetch",
      // Third-party widget errors
      FB_FRAGMENT_REGEX,
      GOOGLE_REGEX,
      GSTATIC_REGEX,
    ],

    // Filter out transactions for static assets and health checks
    ignoreTransactions: [
      STATIC_ASSETS_REGEX,
      FAVICON_REGEX,
      HEALTH_REGEX,
      API_HEALTH_REGEX,
      MONITORING_REGEX,
    ],

    // Only capture errors from ATL domains
    allowUrls: [
      LOCALHOST_REGEX,
      ATL_DOMAINS_ALLOW_REGEX,
      RELATIVE_URL_REGEX, // Relative URLs (same origin)
    ],

    // Filter sensitive data before sending
    beforeSend: createBeforeSend(isProduction),

    // Filter transaction data
    beforeSendTransaction,

    // Filter breadcrumbs to reduce noise
    beforeBreadcrumb: createBeforeBreadcrumb(isProduction),
    // Configure trace propagation for distributed tracing
    tracePropagationTargets: [
      "localhost",
      ATL_DEV_REGEX,
      ATL_SH_REGEX,
      ATL_TOOLS_REGEX,
      ATL_CHAT_REGEX,
      API_ROUTE_REGEX,
    ],
    // Smart sampling based on transaction importance using portalSampler
    tracesSampler: createTracesSampler(isProduction),
    // Browser profiling sample rate
    profileSessionSampleRate: isProduction ? 0.1 : 1,
    ...(replay && {
      // Always capture replays on errors (100%)
      replaysOnErrorSampleRate: 1,
      // Lower session replay rate in production
      replaysSessionSampleRate: isProduction ? 0.01 : 0.1,
    }),
    integrations,
  });
};
