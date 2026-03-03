// ============================================================================
// TanStack Query SSR/Hydration Utilities
// ============================================================================
// Utilities for server-side rendering and hydration with TanStack Query
// in Next.js App Router
//
// These utilities support streaming SSR where pending queries can be
// dehydrated and streamed to the client as they resolve.

import { dehydrate } from "@tanstack/react-query";

import { getQueryClient } from "./query-client";

/**
 * Get QueryClient instance for server-side rendering
 * This is an alias for getQueryClient() for clarity in Server Components.
 *
 * On the server, this creates a new QueryClient per request (isolated cache).
 * This ensures data is not shared between different users and requests.
 */
export function getServerQueryClient() {
  return getQueryClient();
}

/**
 * Dehydrate QueryClient state for hydration
 *
 * This uses the default dehydrate options configured in getQueryClient(),
 * which includes support for pending queries (for streaming).
 *
 * You typically don't need to call this directly - just use dehydrate(queryClient)
 * unless you need custom dehydration logic.
 */
export function dehydrateQueryClient(
  queryClient: ReturnType<typeof getQueryClient>
) {
  // Use default dehydrate which respects the shouldDehydrateQuery
  // configuration from makeQueryClient()
  return dehydrate(queryClient);
}

/**
 * Prefetch queries in parallel on the server
 *
 * Use this helper to prefetch multiple queries efficiently.
 * Note: With streaming support enabled, you don't need to await
 * prefetches - they can be kicked off and streamed as they resolve.
 */
export async function prefetchQueries<T>(
  prefetchers: Array<() => Promise<T>>
): Promise<void> {
  await Promise.all(prefetchers.map((prefetch) => prefetch()));
}
