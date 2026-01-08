/*
 * This file configures the initialization of Sentry on the server.
 * The config you add here will be used whenever the server handles a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import "server-only";

// Regex constants for performance
const REQUEST_ABORTED_PATTERN = /Request aborted/;
const HEALTH_CHECK_PATTERN = /^GET \/health/;
const API_HEALTH_PATTERN = /^GET \/api\/health/;
const MONITORING_PATTERN = /^GET \/monitoring/;
const NEXT_STATIC_PATTERN = /^GET \/_next\/static\//;
const FAVICON_PATTERN = /^GET \/favicon/;

import {
  consoleLoggingIntegration,
  httpIntegration,
  init,
  zodErrorsIntegration,
} from "@sentry/nextjs";

import { keys } from "./keys";

export const initializeSentry = (): ReturnType<typeof init> => {
  const env = keys();

  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry not configured, return early
    return undefined as ReturnType<typeof init>;
  }

  // Environment-based sample rates
  const isProduction = process.env.NODE_ENV === "production";

  const integrations = [
    // Send console.log, console.error, and console.warn calls as logs to Sentry
    consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),

    // HTTP integration for request/response tracking
    httpIntegration({
      spans: true, // Enable spans for outgoing HTTP requests
      breadcrumbs: true, // Enable breadcrumbs for HTTP requests
      ignoreIncomingRequests: (urlPath) => {
        // Ignore health checks and monitoring endpoints
        return (
          urlPath.includes("/health") ||
          urlPath.includes("/api/health") ||
          urlPath.includes("/monitoring")
        );
      },
      ignoreOutgoingRequests: (url) => {
        // Ignore requests to Sentry itself to prevent loops
        return url.includes("sentry.io");
      },
      maxIncomingRequestBodySize: "medium", // 10KB limit for request bodies
    }),

    // Zod validation error enhancement
    zodErrorsIntegration({
      limit: 10, // Limit validation errors per event
    }),
  ];

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

  // Add Node profiling integration
  try {
    const { nodeProfilingIntegration } = require("@sentry/profiling-node");
    integrations.push(nodeProfilingIntegration());
  } catch {
    // @sentry/profiling-node not available, skip profiling
  }

  // Add event loop block detection for performance monitoring
  try {
    const { eventLoopBlockIntegration } = require("@sentry/node-native");
    integrations.push(
      eventLoopBlockIntegration({
        threshold: isProduction ? 2000 : 1000, // 2s in prod, 1s in dev
      })
    );
  } catch {
    // @sentry/node-native not available, skip event loop monitoring
  }

  return init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment and release info
    environment: process.env.NODE_ENV,
    release: env.SENTRY_RELEASE,

    // Enable logging
    enableLogs: true,

    // Filter out common server errors that aren't actionable
    ignoreErrors: [
      "ECONNRESET",
      "EPIPE",
      "ENOTFOUND",
      "ECONNREFUSED",
      "socket hang up",
      REQUEST_ABORTED_PATTERN,
    ],

    // Filter out health check and monitoring transactions
    ignoreTransactions: [
      HEALTH_CHECK_PATTERN,
      API_HEALTH_PATTERN,
      MONITORING_PATTERN,
      NEXT_STATIC_PATTERN,
      FAVICON_PATTERN,
    ],

    // Filter sensitive data before sending
    beforeSend(event) {
      // Remove sensitive request data
      if (event.request) {
        event.request.cookies = undefined;
        if (event.request.headers) {
          (
            event.request.headers as Record<string, string | undefined>
          ).authorization = undefined;
          (event.request.headers as Record<string, string | undefined>).cookie =
            undefined;
        }
      }

      // Remove sensitive user data
      if (event.user) {
        event.user.email = undefined;
        event.user.ip_address = undefined;
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

    // Lower sample rate in production to reduce costs
    // In production: 10% of transactions
    // In development: 100% of transactions
    tracesSampleRate: isProduction ? 0.1 : 1,

    // Node profiling sample rate
    profileSessionSampleRate: isProduction ? 0.1 : 1,

    // Use trace lifecycle profiling (automatic)
    profileLifecycle: "trace",

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Integrations for console logging and profiling
    integrations,
  });
};
