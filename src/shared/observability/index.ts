/** biome-ignore-all lint/performance/noBarrelFile: Barrel file for @/shared/observability */

// Core initialization
export { initializeSentry as initializeSentryClient } from "./client";
export { initializeSentry as initializeSentryEdge } from "./edge";
export * from "./helpers";
export { keys } from "./keys";
export { initializeSentry as initializeSentryServer } from "./server";
export { captureError, log, parseError } from "./utils";
// Wide events (canonical log lines)
export {
  createWideEvent,
  emitWideEvent,
  enrichWideEventWithError,
  enrichWideEventWithUser,
  type WideEvent,
  withWideEvent,
} from "./wide-events";
