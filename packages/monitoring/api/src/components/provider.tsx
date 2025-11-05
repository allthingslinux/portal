'use client';

import { lazy } from 'react';

import { createRegistry } from '@portal/shared/registry';

import {
  MonitoringProvider as MonitoringProviderType,
  getMonitoringProvider,
} from '../get-monitoring-provider';

// Define the type for our provider components
type ProviderComponent = {
  default: React.ComponentType<React.PropsWithChildren>;
};

const provider = getMonitoringProvider();

const Provider = provider
  ? lazy(() => monitoringProviderRegistry.get(provider))
  : null;

// Create a registry for monitoring providers
const monitoringProviderRegistry = createRegistry<
  ProviderComponent,
  NonNullable<MonitoringProviderType>
>();

// Register the Sentry provider
monitoringProviderRegistry.register('sentry', async () => {
  const { SentryProvider } = await import('@portal/sentry/provider');

  return {
    default: function SentryProviderWrapper({
      children,
    }: React.PropsWithChildren) {
      return <SentryProvider>{children}</SentryProvider>;
    },
  };
});

/**
 * @name MonitoringProvider
 * @description This component is used to wrap the application with the appropriate monitoring provider.
 * @param props
 * @returns
 */
export function MonitoringProvider(props: React.PropsWithChildren) {
  if (!Provider) {
    return <>{props.children}</>;
  }

  return <Provider>{props.children}</Provider>;
}
