import pino from "pino";

/**
 * Determine log level based on environment
 * - Production: "info" (only info, warn, error, fatal)
 * - Development: "debug" (all logs including debug)
 */
const getLogLevel = () => {
  // Allow override via environment variable
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }

  // Default to info in production, debug in development
  return process.env.NODE_ENV === "production" ? "info" : "debug";
};

/**
 * @name Logger
 * @description A logger implementation using Pino
 */
const Logger = pino({
  browser: {
    asObject: true,
  },
  level: getLogLevel(),
  base: {
    env: process.env.NODE_ENV,
  },
  errorKey: "error",
});

export { Logger };
