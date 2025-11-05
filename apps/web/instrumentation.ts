/**
 * This file is used to register monitoring instrumentation
 * for your Next.js application.
 */
import { type Instrumentation } from 'next';

export async function register() {
  const { registerMonitoringInstrumentation } = await import(
    '@portal/monitoring/instrumentation'
  );

  // Register monitoring instrumentation
  // based on the MONITORING_PROVIDER environment variable.
  await registerMonitoringInstrumentation();
}

/**
 * @name onRequestError
 * @description This function is called when an error occurs during the request lifecycle.
 * It is used to capture the error and send it to the monitoring service.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const { getServerMonitoringService } = await import('@portal/monitoring/server');

  const service = await getServerMonitoringService();

  await service.ready();

  await service.captureException(
    err as Error,
    {},
    {
      path: request.path,
      headers: request.headers,
      method: request.method,
      routePath: context.routePath,
    },
  );
};
