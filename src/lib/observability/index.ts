/** biome-ignore-all lint/performance/noBarrelFile: Observability package exports are intentionally centralized */

export {
  cacheConfigs,
  calculateCacheItemSize,
  instrumentCacheGet,
  instrumentCacheSet,
} from "./cache";
export { initializeSentry as initializeSentryClient } from "./client";
export {
  addActionBreadcrumb,
  initializePortalContext,
  setBrowserContext,
  setDeploymentContext,
  setFeatureContext,
  setPortalTags,
  setPortalUser,
} from "./enrichment";
export { captureError, parseError } from "./error";
export {
  fingerprintPatterns,
  initializeFingerprinting,
  setFingerprint,
} from "./fingerprinting";
export { httpClient, instrumentHttpRequest } from "./http";
export {
  captureExceptionWithLevel,
  captureMessageWithLevel,
  levelPatterns,
  setLevel,
} from "./levels";
export { log } from "./log";
export {
  incrementCounter,
  portalMetrics,
  recordDistribution,
  setGauge,
} from "./metrics";
export {
  calculateReceiveLatency,
  createQueueMessage,
  instrumentQueueConsumer,
  instrumentQueueProducer,
} from "./queue";
export {
  errorSamplingRates,
  portalSampler,
  samplingPatterns,
} from "./sampling";
export {
  scopePatterns,
  setGlobalData,
  withIsolatedScope,
  withLocalScope,
} from "./scopes";
export {
  addSpanMetrics,
  createManualSpan,
  createMetricSpan,
  spanMetrics,
  updateSpanName,
} from "./span";
export { continueTrace, getTraceHeaders, startNewTrace } from "./trace";
export {
  initializeTransactionSanitization,
  sanitizeTransactionName,
  setLongAttribute,
  setUrlAttributes,
} from "./troubleshooting";
