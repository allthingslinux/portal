import { createRegistry } from "../registry";
import type { Logger as LoggerInstance } from "./logger";

type LoggerProvider = "pino" | "console";

const LOGGER = (process.env.LOGGER ?? "pino") as LoggerProvider;

const loggerRegistry = createRegistry<LoggerInstance, LoggerProvider>();

loggerRegistry.register("pino", async () => {
  const { Logger: PinoLogger } = await import("./impl/pino");
  return PinoLogger;
});

loggerRegistry.register("console", async () => {
  const { Logger: ConsoleLogger } = await import("./impl/console");
  return ConsoleLogger;
});

export async function getLogger() {
  return loggerRegistry.get(LOGGER);
}
