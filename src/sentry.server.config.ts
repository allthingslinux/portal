/*
 * This file configures the initialization of Sentry on the server.
 * Next.js loads it automatically. We skip loading in development to avoid
 * next-prerender-crypto: Sentry scope/trace uses crypto.randomUUID() during
 * MetadataOutlet before request data is read.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

if (process.env.NODE_ENV !== "development") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- avoid loading @sentry in dev (next-prerender-crypto)
  const { initializeSentry } = require("@/shared/observability/server");
  initializeSentry();
}
