type TrackEvent = {
  trackEvent(
    eventName: string,
    eventProperties?: Record<string, string | string[]>
  ): Promise<unknown>;
};

type TrackPageView = {
  trackPageView(path: string): Promise<unknown>;
};

type Identify = {
  identify(userId: string, traits?: Record<string, string>): Promise<unknown>;
};

type ProviderManager = {
  addProvider(provider: string, config: object): Promise<unknown>;

  removeProvider(provider: string): void;
};

export type AnalyticsService = TrackPageView &
  TrackEvent &
  Identify & {
    initialize(): Promise<unknown>;
  };

export type AnalyticsProviderFactory<Config extends object> = (
  config?: Config
) => AnalyticsService;

export type CreateAnalyticsManagerOptions<
  T extends string,
  Config extends object,
> = {
  providers: Record<T, AnalyticsProviderFactory<Config>>;
};

export type AnalyticsManager = TrackPageView &
  TrackEvent &
  Identify &
  ProviderManager;
