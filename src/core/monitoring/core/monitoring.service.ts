/**
 * Monitoring service interface
 * @description This service is used to capture exceptions and identify users in the monitoring service
 * @example
 */
export abstract class MonitoringService {
  /**
   * Capture an exception
   * @param error - The error to capture
   * @param extra - Extra information to capture with the error and be passed along to the capture event
   * @param config - Options to pass along to the service for additional configuration
   */
  abstract captureException<
    Extra extends Record<string, unknown>,
    Config extends Record<string, unknown>,
  >(
    error: Error & { digest?: string },
    extra?: Extra,
    config?: Config,
  ): unknown;

  /**
   * Track an event
   * @param event
   * @param extra
   */
  abstract captureEvent<Extra extends object>(
    event: string,
    extra?: Extra,
  ): unknown;

  /**
   * Identify a user in the monitoring service - used for tracking user actions
   * @param info
   */
  abstract identifyUser<Info extends { id: string }>(info: Info): unknown;

  /**
   * Wait for the monitoring service to be ready
   */
  abstract ready(): Promise<unknown>;
}
