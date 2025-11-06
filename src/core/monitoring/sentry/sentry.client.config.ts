import { init } from '@sentry/nextjs';

type Parameters<T extends (args: never) => unknown> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

/**
 * @name initializeSentryBrowserClient
 * @description Initialize the Sentry client
 * @param props
 */
export function initializeSentryBrowserClient(
  props: Parameters<typeof init>[0] = {},
) {
  return init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Replay may only be enabled for the client-side
    integrations: [
      // add your desired integrations here
      // https://docs.sentry.io/platforms/javascript/configuration/integrations/
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: props?.tracesSampleRate ?? 1.0,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // ...

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps,
    ...props,
  });
}
