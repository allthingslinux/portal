/**
 * Scope utilities for managing Sentry context data
 */

/**
 * Set data on global scope (applies to all events)
 */
export const setGlobalData = (data: {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  context?: Record<string, unknown>;
}): void => {
  try {
    const { getGlobalScope } = require("@sentry/nextjs");
    const scope = getGlobalScope();

    if (data.tags) {
      for (const [key, value] of Object.entries(data.tags)) {
        scope.setTag(key, value);
      }
    }

    if (data.extra) {
      scope.setExtras(data.extra);
    }

    if (data.context) {
      for (const [key, value] of Object.entries(data.context)) {
        scope.setContext(key, value);
      }
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Execute function with isolated scope
 */
export const withIsolatedScope = <T>(
  data: {
    user?: { id: string; email?: string; [key: string]: unknown };
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  },
  fn: () => T
): T => {
  try {
    const {
      withIsolationScope,
      setUser,
      setTag,
      setExtras,
    } = require("@sentry/nextjs");

    return withIsolationScope(() => {
      if (data.user) {
        setUser(data.user);
      }
      if (data.tags) {
        for (const [key, value] of Object.entries(data.tags)) {
          setTag(key, value);
        }
      }
      if (data.extra) {
        setExtras(data.extra);
      }

      return fn();
    });
  } catch {
    // Sentry not available, execute function directly
    return fn();
  }
};

/**
 * Execute function with local scope
 */
export const withLocalScope = <T>(
  data: {
    level?: "fatal" | "error" | "warning" | "log" | "info" | "debug";
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    context?: Record<string, unknown>;
  },
  fn: () => T
): T => {
  try {
    const { withScope } = require("@sentry/nextjs");

    return withScope(
      (scope: {
        setTag: (key: string, value: string) => void;
        setContext: (key: string, value: unknown) => void;
        setUser: (user: unknown) => void;
        setExtras: (extras: Record<string, unknown>) => void;
        setLevel?: (level: string) => void;
      }) => {
        if (data.level) {
          scope.setLevel?.(data.level);
        }
        if (data.tags) {
          for (const [key, value] of Object.entries(data.tags)) {
            scope.setTag(key, value);
          }
        }
        if (data.extra) {
          scope.setExtras(data.extra);
        }
        if (data.context) {
          for (const [key, value] of Object.entries(data.context)) {
            scope.setContext(key, value);
          }
        }

        return fn();
      }
    );
  } catch {
    // Sentry not available, execute function directly
    return fn();
  }
};

/**
 * Common scope patterns for Portal
 */
export const scopePatterns = {
  // Set user context for request
  userContext: (user: { id: string; email?: string; tier?: string }) =>
    withIsolatedScope({ user }, () => {
      // Context set for current scope
    }),

  // Set API request context
  apiContext: (endpoint: string, method: string, userId?: string) =>
    withLocalScope(
      {
        tags: { endpoint, method, ...(userId && { user_id: userId }) },
        context: { api: { endpoint, method } },
      },
      () => {
        // Context set for current scope
      }
    ),

  // Set background job context
  jobContext: (jobName: string, jobId: string) =>
    withIsolatedScope(
      {
        tags: { job_name: jobName, job_id: jobId },
        extra: { job: { name: jobName, id: jobId } },
      },
      () => {
        // Context set for current scope
      }
    ),
};
