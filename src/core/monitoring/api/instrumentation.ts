import { createRegistry } from '~/shared/registry';

import {
  MonitoringProvider,
  getMonitoringProvider,
} from './get-monitoring-provider';

// Define a type for the instrumentation registration implementation
type InstrumentationRegistration = {
  register: () => Promise<void> | void;
};

// Create a registry for instrumentation providers, using literal strings 'baselime' and 'sentry'
const instrumentationRegistry = createRegistry<
  InstrumentationRegistration,
  NonNullable<MonitoringProvider>
>();

// Register the 'sentry' instrumentation provider with a no-op registration, since Sentry v8 sets up automatically
instrumentationRegistry.register('sentry', () => {
  return {
    register: () => {
      return;
    },
  };
});

/**
 * @name registerMonitoringInstrumentation
 * @description Register monitoring instrumentation based on the MONITORING_PROVIDER environment variable using the registry internally.
 */
export async function registerMonitoringInstrumentation() {
  const provider = getMonitoringProvider();

  if (!provider) {
    return;
  }

  const instrumentation = await instrumentationRegistry.get(provider);

  return instrumentation.register();
}
