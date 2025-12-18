import pino from "pino";

const getLogLevel = () => {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
};

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
