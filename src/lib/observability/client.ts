/*
 * This file configures the initialization of Sentry on the client.
 * The config you add here will be used whenever a users loads a page in their browser.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import {
  consoleLoggingIntegration,
  init,
  zodErrorsIntegration,
} from "@sentry/nextjs";

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

import { initializeFingerprinting } from "./fingerprinting";
import { keys } from "./keys";
import { portalSampler } from "./sampling";
import { initializeTransactionSanitization } from "./troubleshooting";

const getReplayIntegration = () => {
  // replayIntegration is only available client-side
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { replayIntegration } = require("@sentry/nextjs");
    return (
      replayIntegration?.({
        maskAllText: true,
        blockAllMedia: true,
      }) ?? null
    );
  } catch {
    return null;
  }
};

export const initializeSentry = (): ReturnType<typeof init> => {
  const env = keys();

  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return undefined as ReturnType<typeof init>;
  }

  // Environment-based sample rates
  const isProduction = process.env.NODE_ENV === "production";

  /**
   * Build integrations array with all required Sentry integrations
   */
  const buildIntegrations = (isProd: boolean) => {
    const integrations = [
      consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),

      // Zod validation error enhancement
      zodErrorsIntegration({
        limit: 10, // Limit validation errors per event
      }),
    ];

    // Client-only integrations - only load when in browser context
    if (typeof window !== "undefined") {
      // HTTP client integration for fetch/XHR error tracking (client-side only)
      try {
        const { httpClientIntegration } = require("@sentry/nextjs");
        if (httpClientIntegration) {
          integrations.push(
            httpClientIntegration({
              failedRequestStatusCodes: [[400, 599]], // Track 4xx and 5xx errors
              failedRequestTargets: [
                API_ROUTE_REGEX, // Internal API routes
                ATL_DOMAINS_REGEX, // ATL domains
              ],
            })
          );
        }
      } catch {
        // httpClientIntegration not available
      }

      // Reporting Observer for browser deprecations and crashes (client-side only)
      try {
        const { reportingObserverIntegration } = require("@sentry/nextjs");
        if (reportingObserverIntegration) {
          integrations.push(
            reportingObserverIntegration({
              types: ["crash", "deprecation", "intervention"],
            })
          );
        }
      } catch {
        // reportingObserverIntegration not available
      }
    }

    // Add extra error data integration for richer error context
    try {
      const { extraErrorDataIntegration } = require("@sentry/nextjs");
      integrations.push(
        extraErrorDataIntegration({
          depth: 5, // Capture deeper error object properties
          captureErrorCause: true, // Capture error.cause chains
        })
      );
    } catch {
      // Integration not available
    }

    // Add browser tracing with optimized configuration
    try {
      const {
        browserTracingIntegration,
        browserProfilingIntegration,
      } = require("@sentry/nextjs");

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
          // Reduce interaction sampling in production
          interactionsSampleRate: isProd ? 0.1 : 1,
        }),
        browserProfilingIntegration()
      );
    } catch {
      // Fallback if integrations not available
    }

    // Add replay integration at the beginning (important for initialization order)
    const replay = getReplayIntegration();
    if (replay) {
      integrations.unshift(replay);
    }

    return { integrations, replay };
  };

  const { integrations, replay } = buildIntegrations(isProduction);

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
    beforeSend(event, hint) {
      // Remove sensitive user data
      if (event.user) {
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
    },

    // Filter transaction data
    beforeSendTransaction(event) {
      // Remove query parameters that might contain sensitive data
      if (event.transaction) {
        event.transaction = event.transaction.split("?")[0];
      }
      return event;
    },

    // Filter breadcrumbs to reduce noise
    beforeBreadcrumb(breadcrumb) {
      // Skip console breadcrumbs in production
      if (isProduction && breadcrumb.category === "console") {
        return null;
      }

      // Skip UI clicks on non-interactive elements
      if (
        breadcrumb.category === "ui.click" &&
        breadcrumb.message?.includes("div")
      ) {
        return null;
      }

      return breadcrumb;
    },
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
    tracesSampler: (samplingContext) => {
      // Adapt Sentry's TracesSamplerContext to portalSampler's SamplingContext
      const adaptedContext = {
        name:
          samplingContext.transactionContext?.name ||
          samplingContext.name ||
          "",
        attributes: samplingContext.transactionContext?.data,
        parentSampled: samplingContext.parentSampled,
        parentSampleRate: samplingContext.parentSampleRate,
        inheritOrSampleWith: (fallbackRate: number) =>
          samplingContext.parentSampled !== undefined
            ? samplingContext.parentSampled
              ? 1
              : 0
            : Math.random() < fallbackRate
              ? 1
              : 0,
      };

      return portalSampler(isProduction)(adaptedContext);
    },
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
