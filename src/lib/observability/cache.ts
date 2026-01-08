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
 * Normalize cache key into primary key and key array
 */
const normalizeKey = (key: string | string[]) => {
  const keys = Array.isArray(key) ? key : [key];
  return { primaryKey: keys[0], keys };
};

/**
 * Build base cache attributes shared between get and set operations
 */
const baseCacheAttributes = (options: CacheOptions) => {
  const { keys } = normalizeKey(options.key);
  return {
    "cache.key": keys,
    ...(options.address && { "network.peer.address": options.address }),
    ...(options.port && { "network.peer.port": options.port }),
  };
};

/**
 * Instrument cache set operations
 */
export const instrumentCacheSet = async <T>(
  options: CacheSetOptions,
  setter: () => Promise<T> | T
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");
    const { primaryKey } = normalizeKey(options.key);

    return await startSpan(
      {
        name: `cache.set ${primaryKey}`,
        op: "cache.put",
        attributes: {
          ...baseCacheAttributes(options),
          ...(options.itemSize && { "cache.item_size": options.itemSize }),
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
    const { primaryKey } = normalizeKey(options.key);

    return await startSpan(
      {
        name: `cache.get ${primaryKey}`,
        op: "cache.get",
        attributes: baseCacheAttributes(options),
      },
      async (span: { setAttribute: (key: string, value: unknown) => void }) => {
        const result = await getter();

        // Set cache hit/miss and item size
        // Prefer explicit hit parameter; fallback checks if result is not undefined
        // This handles falsy values (0, "", false, null) correctly
        const hit = options.hit ?? result !== undefined;
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
 * Provides preset configurations for different cache backends
 */
export const cacheConfigs = {
  /**
   * Redis cache configuration
   * @param host - Redis server hostname (default: "localhost")
   * @param port - Redis server port (default: 6379)
   * @returns Cache configuration with address and port
   */
  redis: (host = "localhost", port = 6379) => ({ address: host, port }),
  /**
   * In-memory cache configuration
   * @returns Cache configuration for in-memory storage
   */
  memory: () => ({ address: "in-memory" }),
  /**
   * Next.js cache configuration
   * @returns Cache configuration for Next.js built-in cache
   */
  nextjs: () => ({ address: "next-cache" }),
};
