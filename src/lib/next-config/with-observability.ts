import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

import { keys } from "../observability/keys";

/**
 * Add observability configuration to Next.js config
 * This includes Sentry integration when available
 */
export const withObservability = (sourceConfig: NextConfig): NextConfig => {
  const env = keys();

  // Only add Sentry config if org and project are configured
  if (!(env.SENTRY_ORG && env.SENTRY_PROJECT)) {
    return sourceConfig;
  }

  const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
    org: env.SENTRY_ORG,
    project: env.SENTRY_PROJECT,

    // Upload source maps for readable stack traces
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Route Sentry requests through your server (avoids ad-blockers)
    tunnelRoute: "/monitoring",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Source maps configuration
    sourcemaps: {
      disable: false,
      assets: ["**/*.js", "**/*.js.map"],
      ignore: ["**/node_modules/**"],
      deleteSourcemapsAfterUpload: true, // Security: delete after upload
    },

    // Release configuration
    release: {
      name: env.SENTRY_RELEASE,
      create: true,
      finalize: true,
    },

    // Bundle size optimizations
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
    },

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,

    // Webpack tree-shaking configuration for production builds
    webpack: {
      treeshake: {
        removeDebugLogging: process.env.NODE_ENV === "production",
        removeTracing: false, // Keep tracing for performance monitoring
        excludeReplayIframe: false, // Keep iframe capture for session replay
        excludeReplayShadowDOM: true, // Portal doesn't use shadow DOM extensively
        excludeReplayCompressionWorker: false, // Use built-in compression worker
      },
    },

    // Error handling for CI/CD
    errorHandler: (error) => {
      console.warn("Sentry build error occurred:", error);
      // Don't fail the build in CI for Sentry issues
      if (process.env.CI) {
        return;
      }
      throw error;
    },
  };

  return withSentryConfig(
    {
      ...sourceConfig,
      transpilePackages: ["@sentry/nextjs"],
    },
    sentryConfig
  );
};
