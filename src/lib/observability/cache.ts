/**
 * Cache instrumentation utilities for monitoring cache performance
 */

interface CacheOptions {
  key: string | string[];
  address?: string;
  port?: number;
}

interface CacheSetOptions extends CacheOptions {
  itemSize?: number;
}

interface CacheGetOptions extends CacheOptions {
  hit?: boolean;
  itemSize?: number;
}

/**
 * Instrument cache set operations
 */
export const instrumentCacheSet = async <T>(
  options: CacheSetOptions,
  setter: () => Promise<T> | T
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");

    const key = Array.isArray(options.key) ? options.key[0] : options.key;

    return await startSpan(
      {
        name: `cache.set ${key}`,
        op: "cache.put",
        attributes: {
          "cache.key": Array.isArray(options.key) ? options.key : [options.key],
          ...(options.itemSize && { "cache.item_size": options.itemSize }),
          ...(options.address && { "network.peer.address": options.address }),
          ...(options.port && { "network.peer.port": options.port }),
        },
      },
      setter
    );
  } catch {
    // Fallback without instrumentation
    return await setter();
  }
};

/**
 * Instrument cache get operations
 */
export const instrumentCacheGet = async <T>(
  options: CacheGetOptions,
  getter: () => Promise<T> | T
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");

    const key = Array.isArray(options.key) ? options.key[0] : options.key;

    return await startSpan(
      {
        name: `cache.get ${key}`,
        op: "cache.get",
        attributes: {
          "cache.key": Array.isArray(options.key) ? options.key : [options.key],
          ...(options.address && { "network.peer.address": options.address }),
          ...(options.port && { "network.peer.port": options.port }),
        },
      },
      async (span: { setAttribute: (key: string, value: unknown) => void }) => {
        const result = await getter();

        // Set cache hit/miss and item size
        const hit = options.hit ?? Boolean(result);
        span.setAttribute("cache.hit", hit);

        if (hit && options.itemSize) {
          span.setAttribute("cache.item_size", options.itemSize);
        }

        return result;
      }
    );
  } catch {
    // Fallback without instrumentation
    return await getter();
  }
};

/**
 * Helper to calculate item size for common data types
 */
export const calculateCacheItemSize = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "string") {
    return value.length;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }
  return String(value).length;
};

/**
 * Common cache configurations for Portal
 */
export const cacheConfigs = {
  redis: (host = "localhost", port = 6379) => ({ address: host, port }),
  memory: () => ({ address: "in-memory" }),
  nextjs: () => ({ address: "next-cache" }),
};
