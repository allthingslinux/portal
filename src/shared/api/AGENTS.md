# src/shared/api

> Scope: TanStack Query setup, query key factory, server-side queries, and API utility types.

## What Lives Here

| File | Purpose |
|------|---------|
| `query-keys.ts` | Query key factory — all TanStack Query keys defined here |
| `query-client.ts` | TanStack QueryClient configuration (stale times, retry, etc.) |
| `server-queries.ts` | Server-side data fetching functions (for RSC prefetching) |
| `hydration.ts` | HydrationBoundary setup for RSC → client handoff |
| `types.ts` | API response/request types (filters, paginated results) |
| `utils.ts` | API utility functions (error parsing, response helpers) |
| `index.ts` | Barrel export |

## Query Key Factory

**Always use the query key factory** — never hardcode query key strings.

```typescript
import { queryKeys } from "@/shared/api/query-keys"

// Reading keys (for useQuery)
useQuery({ queryKey: queryKeys.users.list(filters) })
useQuery({ queryKey: queryKeys.users.detail(userId) })
useQuery({ queryKey: queryKeys.integrations.all() })

// Invalidating after mutations
queryClient.invalidateQueries({ queryKey: queryKeys.users.list() })
```

## TanStack Query in Client Components

```typescript
"use client"
import { useQuery, useMutation } from "@tanstack/react-query"
import { queryKeys } from "@/shared/api/query-keys"
import { QUERY_CACHE } from "@/shared/utils/constants"

function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => fetch("/api/users").then(r => r.json()),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  })
}
```

## Server-Side Prefetching (RSC)

Use `server-queries.ts` functions in Server Components to prefetch data into the dehydrated state:

```typescript
// Server Component (page.tsx)
import { prefetchUsers } from "@/shared/api/server-queries"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "@/shared/api/query-client"

export default async function Page() {
  const queryClient = getQueryClient()
  await prefetchUsers(queryClient)
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  )
}
```

## Stale Times

Use constants from `@/shared/utils/constants` — don't hardcode millisecond values:

| Constant | Value | Use For |
|----------|-------|---------|
| `QUERY_CACHE.STALE_TIME_SHORT` | 30s | Frequently changing data (stats, counts) |
| `QUERY_CACHE.STALE_TIME_DEFAULT` | 5min | Standard user/entity data |
| `QUERY_CACHE.STALE_TIME_LONG` | 30min | Rarely changing data (config, permissions) |

## Critical Rules

- **Never hardcode query key strings** — always use `queryKeys.*` factory.
- **Always invalidate after mutations** — don't let stale data linger.
- **Use `QUERY_CACHE` constants** for stale/gc times, not magic numbers.
- **`server-queries.ts` is server-only** — never import it in client components.
