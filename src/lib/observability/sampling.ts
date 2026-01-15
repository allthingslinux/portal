/**
 * Sampling utilities for managing Sentry sampling decisions
 */

interface SamplingContext {
  name: string;
  attributes?: Record<string, unknown>;
  parentSampled?: boolean;
  parentSampleRate?: number;
  inheritOrSampleWith: (fallbackRate: number) => number;
}

/**
 * Helper function to check if transaction should be skipped
 */
const shouldSkipTransaction = (name: string): boolean => {
  return name.includes("health") || name.includes("metrics");
};

/**
 * Helper function to check if transaction is critical auth flow
 */
const isCriticalAuthFlow = (name: string): boolean => {
  return (
    name.includes("auth") || name.includes("login") || name.includes("signup")
  );
};

/**
 * Helper function to get API route sampling rate
 */
const getApiRouteSamplingRate = (
  name: string,
  isProduction: boolean
): number | null => {
  if (name.includes("/api/")) {
    return isProduction ? 0.3 : 1;
  }
  return null;
};

/**
 * Helper function to get static asset sampling rate
 */
const getStaticAssetSamplingRate = (
  name: string,
  isProduction: boolean
): number | null => {
  if (name.includes("/_next/") || name.includes("/favicon")) {
    return isProduction ? 0.01 : 0.1;
  }
  return null;
};

/**
 * Helper function to get user tier sampling rate
 */
const getUserTierSamplingRate = (
  attributes: Record<string, unknown> | undefined,
  isProduction: boolean
): number | null => {
  if (attributes?.userTier === "premium") {
    return isProduction ? 0.5 : 1;
  }
  return null;
};

/**
 * Portal's intelligent sampling function
 * Used in client configuration - extracted for reusability
 */
export const portalSampler = (isProduction: boolean) => {
  return (samplingContext: SamplingContext): number => {
    const { name, attributes, inheritOrSampleWith } = samplingContext;

    // Skip health checks and monitoring endpoints
    if (shouldSkipTransaction(name)) {
      return 0;
    }

    // Always sample auth flows (critical user experience)
    if (isCriticalAuthFlow(name)) {
      return 1;
    }

    // High sampling for API routes (important for debugging)
    const apiRate = getApiRouteSamplingRate(name, isProduction);
    if (apiRate !== null) {
      return apiRate;
    }

    // Lower sampling for static assets
    const staticRate = getStaticAssetSamplingRate(name, isProduction);
    if (staticRate !== null) {
      return staticRate;
    }

    // Sample based on user tier if available
    const tierRate = getUserTierSamplingRate(attributes, isProduction);
    if (tierRate !== null) {
      return tierRate;
    }

    // Default rates based on environment
    return inheritOrSampleWith(isProduction ? 0.1 : 1);
  };
};

/**
 * Common sampling patterns for different scenarios
 */
export const samplingPatterns = {
  // Always inherit parent decision (recommended for distributed tracing)
  inherit: (samplingContext: SamplingContext) => {
    if (samplingContext.parentSampled !== undefined) {
      return samplingContext.parentSampled ? 1 : 0;
    }
    return samplingContext.inheritOrSampleWith(0.1);
  },

  // High-value transactions only
  highValue: (samplingContext: SamplingContext) => {
    const { name, attributes } = samplingContext;

    // Critical business flows
    if (
      name.includes("checkout") ||
      name.includes("payment") ||
      name.includes("auth")
    ) {
      return 1;
    }

    // Premium users
    if (attributes?.userTier === "premium") {
      return 0.5;
    }

    // Everything else - low sampling
    return 0.01;
  },

  // Development-friendly sampling
  development: (samplingContext: SamplingContext) => {
    const { name } = samplingContext;

    // Skip noisy endpoints
    if (
      name.includes("health") ||
      name.includes("metrics") ||
      name.includes("favicon")
    ) {
      return 0;
    }

    // Sample everything else in development
    return 1;
  },
};

/**
 * Error sampling rate recommendations
 */
export const errorSamplingRates = {
  development: 1.0, // Capture all errors in development
  staging: 1.0, // Capture all errors in staging
  production: 1.0, // Usually keep at 1.0 for errors (use rate limiting instead)
};
