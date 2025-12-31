export abstract class MonitoringService {
  abstract captureException<
    Extra extends Record<string, unknown>,
    Config extends Record<string, unknown>,
  >(
    error: Error & { digest?: string },
    extra?: Extra,
    config?: Config
  ): unknown;

  abstract captureEvent<Extra extends object>(
    event: string,
    extra?: Extra
  ): unknown;

  abstract identifyUser<Info extends { id: string }>(info: Info): unknown;

  abstract ready(): Promise<unknown>;
}
