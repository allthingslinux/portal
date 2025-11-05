import {
  ConsoleMonitoringService,
  MonitoringService,
} from '@portal/monitoring-core';
import { createRegistry } from '@portal/shared/registry';

import {
  MonitoringProvider,
  getMonitoringProvider,
} from '../get-monitoring-provider';

// create a registry for the server monitoring services
const serverMonitoringRegistry = createRegistry<
  MonitoringService,
  NonNullable<MonitoringProvider>
>();

// Register the 'sentry' monitoring service
serverMonitoringRegistry.register('sentry', async () => {
  const { SentryMonitoringService } = await import('@portal/sentry');

  return new SentryMonitoringService();
});

// if you have a new monitoring provider, you can register it here
//

/**
 * @name getServerMonitoringService
 * @description Get the monitoring service based on the MONITORING_PROVIDER environment variable.
 */
export async function getServerMonitoringService() {
  const provider = getMonitoringProvider();

  if (!provider) {
    console.info(
      `No instrumentation provider specified. Returning console service...`,
    );

    return new ConsoleMonitoringService();
  }

  return serverMonitoringRegistry.get(provider);
}
