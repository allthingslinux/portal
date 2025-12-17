type LogFn = {
  <T extends object>(obj: T, msg?: string, ...args: unknown[]): void;
  (obj: unknown, msg?: string, ...args: unknown[]): void;
  (msg: string, ...args: unknown[]): void;
};

/**
 * @name Logger
 * @description Logger type for logging messages
 */
export type Logger = {
  info: LogFn;
  error: LogFn;
  warn: LogFn;
  debug: LogFn;
  fatal: LogFn;
};
