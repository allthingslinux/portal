import {
  Event as SentryEvent,
  User as SentryUser,
  captureEvent,
  captureException,
  setUser,
} from '@sentry/nextjs';

import { MonitoringService } from '~/core/monitoring/core';

/**
 * @class
 * @implements {MonitoringService}
 * ServerSentryMonitoringService is responsible for capturing exceptions and identifying users using the Sentry monitoring service.
 */
export class SentryMonitoringService implements MonitoringService {
  private readonly readyPromise: Promise<unknown>;
  private readyResolver?: (value?: unknown) => void;

  constructor() {
    this.readyPromise = new Promise(
      (resolve) => (this.readyResolver = resolve),
    );

    void this.initialize();
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

    if (typeof document !== 'undefined') {
      const { initializeSentryBrowserClient } = await import(
        '../sentry.client.config'
      );

      initializeSentryBrowserClient({
        environment,
      });
    } else {
      const { initializeSentryServerClient } = await import(
        '../sentry.server.config'
      );

      initializeSentryServerClient({
        environment,
      });
    }

    this.readyResolver?.();
  }
}
