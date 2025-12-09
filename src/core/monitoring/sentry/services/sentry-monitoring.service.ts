import {
  captureEvent,
  captureException,
  type Event as SentryEvent,
  type User as SentryUser,
  setUser,
} from "@sentry/nextjs";

import type { MonitoringService } from "~/core/monitoring/core";

/**
 * @class
 * @implements {MonitoringService}
 * ServerSentryMonitoringService is responsible for capturing exceptions and identifying users using the Sentry monitoring service.
 */
export class SentryMonitoringService implements MonitoringService {
  private readonly readyPromise: Promise<unknown>;
  private readonly readyResolver?: (value?: unknown) => void;

  constructor() {
    let resolver: (value?: unknown) => void;
    this.readyPromise = new Promise((resolve) => {
      resolver = resolve;
    });
    this.readyResolver = resolver;

    this.initialize().catch(() => {
      // Ignore initialization errors
    });
  }

  async ready() {
    return this.readyPromise;
  }

  captureException(error: Error | null) {
    return captureException(error);
  }

  captureEvent<Extra extends SentryEvent>(event: string, extra?: Extra) {
    return captureEvent({
      message: event,
      ...(extra ?? {}),
    });
  }

  identifyUser(user: SentryUser) {
    setUser(user);
  }

  private async initialize() {
    const environment =
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV;

    if (typeof document !== "undefined") {
      const { initializeSentryBrowserClient } = await import(
        "../sentry.client.config"
      );

      initializeSentryBrowserClient({
        environment,
      });
    } else {
      const { initializeSentryServerClient } = await import(
        "../sentry.server.config"
      );

      initializeSentryServerClient({
        environment,
      });
    }

    this.readyResolver?.();
  }
}
