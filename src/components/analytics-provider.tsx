"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useEffectEvent } from "react";

import { analytics } from "~/lib/monitoring/analytics";
import {
  type AppEvent,
  type AppEventType,
  type ConsumerProvidedEventTypes,
  useAppEvents,
} from "~/shared/events";
import { isBrowser } from "~/utils/utils";

type AnalyticsMapping<
  T extends ConsumerProvidedEventTypes = NonNullable<unknown>,
> = {
  [K in AppEventType<T>]?: (event: AppEvent<T, K>) => unknown;
};

/**
 * Hook to subscribe to app events and map them to analytics actions
 * @param mapping
 */
function useAnalyticsMapping<T extends ConsumerProvidedEventTypes>(
  mapping: AnalyticsMapping<T>
) {
  const appEvents = useAppEvents<T>();

  const subscribeToAppEvent = useEffectEvent(
    (
      eventType: AppEventType<T>,
      handler: (event: AppEvent<T, AppEventType<T>>) => unknown
    ) => {
      appEvents.on(eventType, handler);
    }
  );

  const unsubscribeFromAppEvent = useEffectEvent(
    (
      eventType: AppEventType<T>,
      handler: (event: AppEvent<T, AppEventType<T>>) => unknown
    ) => {
      appEvents.off(eventType, handler);
    }
  );

  useEffect(() => {
    const subscriptions = Object.entries(mapping).map(
      ([eventType, handler]) => {
        subscribeToAppEvent(eventType as AppEventType<T>, handler);

        return () =>
          unsubscribeFromAppEvent(eventType as AppEventType<T>, handler);
      }
    );

    return () => {
      for (const unsubscribe of subscriptions) {
        unsubscribe();
      }
    };
  }, [mapping]);
}

/**
 * Define a mapping of app events to analytics actions
 * Add new mappings here to track new events in the analytics service from app events
 */
const analyticsMapping: AnalyticsMapping = {
  "user.signedIn": (event) => {
    const { userId, ...traits } = event.payload;

    if (userId) {
      return analytics.identify(userId, traits);
    }
  },
  "user.signedUp": (event) => analytics.trackEvent(event.type, event.payload),
  "user.updated": (event) => analytics.trackEvent(event.type, event.payload),
};

function AnalyticsProviderBrowser(props: React.PropsWithChildren) {
  // Subscribe to app events and map them to analytics actions
  useAnalyticsMapping(analyticsMapping);

  // Report page views to the analytics service
  useReportPageView(useCallback((url) => analytics.trackPageView(url), []));

  // Render children
  return props.children;
}

/**
 * Provider for the analytics service
 */
export function AnalyticsProvider(props: React.PropsWithChildren) {
  if (!isBrowser()) {
    return props.children;
  }

  return <AnalyticsProviderBrowser>{props.children}</AnalyticsProviderBrowser>;
}

/**
 * Hook to report page views to the analytics service
 * @param reportAnalyticsFn
 */
function useReportPageView(reportAnalyticsFn: (url: string) => unknown) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const callAnalyticsOnPathChange = useEffectEvent(() => {
    const url = [pathname, searchParams.toString()].filter(Boolean).join("?");

    return reportAnalyticsFn(url);
  });

  useEffect(() => {
    callAnalyticsOnPathChange();
    // call whenever the pathname changes
  }, []);
}
