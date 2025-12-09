import { NullAnalyticsService } from "./null-analytics-service";
import type {
  AnalyticsManager,
  AnalyticsService,
  CreateAnalyticsManagerOptions,
} from "./types";

export function createAnalyticsManager<T extends string, Config extends object>(
  options: CreateAnalyticsManagerOptions<T, Config>
): AnalyticsManager {
  const activeServices = new Map<T, AnalyticsService>();

  const getActiveServices = (): AnalyticsService[] => {
    if (activeServices.size === 0) {
      console.debug(
        "No active analytics services. Using NullAnalyticsService."
      );

      return [NullAnalyticsService];
    }

    return Array.from(activeServices.values());
  };

  const registerActiveServices = (
    managerOptions: CreateAnalyticsManagerOptions<T, Config>
  ) => {
    for (const provider of Object.keys(managerOptions.providers)) {
      const providerKey = provider as keyof typeof managerOptions.providers;
      const factory = managerOptions.providers[providerKey];

      if (!factory) {
        console.warn(
          `Analytics provider '${provider}' not registered. Skipping initialization.`
        );

        continue;
      }

      const service = factory();
      activeServices.set(provider as T, service);

      initializeService(provider, service);
    }
  };

  const initializeService = (
    provider: string,
    service: AnalyticsService
  ): Promise<unknown> => {
    try {
      return Promise.resolve(service.initialize()).catch((error) => {
        console.error(
          `Failed to initialize analytics provider '${provider}':`,
          error
        );
      });
    } catch (error) {
      console.error(
        `Failed to initialize analytics provider '${provider}':`,
        error
      );

      return Promise.resolve();
    }
  };

  registerActiveServices(options);

  return {
    addProvider: (provider: T, config: Config) => {
      const factory = options.providers[provider];

      if (!factory) {
        console.warn(
          `Analytics provider '${provider}' not registered. Skipping initialization.`
        );

        return Promise.resolve();
      }

      const service = factory(config);
      activeServices.set(provider, service);

      return initializeService(provider, service);
    },

    removeProvider: (provider: T) => {
      activeServices.delete(provider);
    },

    identify: (userId: string, traits?: Record<string, string>) =>
      Promise.all(
        getActiveServices().map((service) => service.identify(userId, traits))
      ),

    trackPageView: (path: string) =>
      Promise.all(
        getActiveServices().map((service) => service.trackPageView(path))
      ),

    trackEvent: (
      eventName: string,
      eventProperties?: Record<string, string | string[]>
    ) =>
      Promise.all(
        getActiveServices().map((service) =>
          service.trackEvent(eventName, eventProperties)
        )
      ),
  };
}
