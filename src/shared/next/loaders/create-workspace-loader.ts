import 'server-only';

import { cache } from 'react';

/**
 * Creates a cached workspace loader function with common patterns.
 * Wraps the loader function with React's cache() to ensure data is only fetched once per request.
 *
 * @param loaderFn - The loader function that fetches workspace data
 * @returns A cached loader function
 *
 * @example
 * ```ts
 * export const loadUserWorkspace = createWorkspaceLoader(async () => {
 *   // loader implementation
 * });
 * ```
 */
export function createWorkspaceLoader<TParams extends unknown[], TReturn>(
  loaderFn: (...params: TParams) => Promise<TReturn>,
) {
  return cache(loaderFn);
}

