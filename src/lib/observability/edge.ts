/*
 * This file configures the initialization of Sentry on the Edge runtime.
 * The config you add here will be used whenever Edge functions handle a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import "server-only";

import {
  consoleLoggingIntegration,
  httpIntegration,
  init,
  zodErrorsIntegration,
} from "@sentry/nextjs";

// Common regex patterns for edge runtime filtering
const REQUEST_ABORTED_REGEX = /Request aborted/;
const EDGE_RUNTIME_REGEX = /edge runtime/i;
const HEALTH_CHECK_REGEX = /^GET \/health/;
const API_HEALTH_REGEX = /^GET \/api\/health/;
const MONITORING_REGEX = /^GET \/monitoring/;
const STATIC_ASSETS_REGEX = /^GET \/_next\/static\//;
const FAVICON_REGEX = /^GET \/favicon/;

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
      maxIncomingRequestBodySize: "small", // 1KB limit for edge runtime
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

  return init({
    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    // Environment and release info
    environment: process.env.NODE_ENV,
    release: env.SENTRY_RELEASE || "unknown",

    // Enable logging
    enableLogs: true,

    // Filter out common edge runtime errors
    ignoreErrors: [
      "ECONNRESET",
      "EPIPE",
      "ENOTFOUND",
      REQUEST_ABORTED_REGEX,
      EDGE_RUNTIME_REGEX,
    ],

    // Filter out health check and monitoring transactions
    ignoreTransactions: [
      HEALTH_CHECK_REGEX,
      API_HEALTH_REGEX,
      MONITORING_REGEX,
      STATIC_ASSETS_REGEX,
      FAVICON_REGEX,
    ],

    // Filter sensitive data before sending
    beforeSend(event) {
      // Remove sensitive request data
      if (event.request) {
        event.request.cookies = undefined;
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, unknown>;
          headers.authorization = undefined;
          headers.cookie = undefined;
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

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Integrations for console logging and error data
    integrations,
  });
};
