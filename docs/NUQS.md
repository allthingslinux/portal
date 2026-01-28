# nuqs implementation guide

This document describes how to add and use [nuqs](https://nuqs.dev/) in Portal for type-safe, URL-synced search params (filters, pagination, tabs) in line with the existing architecture.

## Why nuqs

- **Type-safe** search params with parsers (integer, boolean, string, etc.).
- **URL as source of truth** for list filters and pagination so links, bookmarks, and back/forward work.
- **Shared descriptor** for server and client: define parsers once, use in `useQueryStates` (client) and `createLoader` / `createSearchParamsCache` (server).
- **Fits Next.js App Router**: adapter uses `next/navigation`; supports Server Components via loaders/cache.

## 1. Install and adapter

**Install:**

```bash
pnpm add nuqs
```

**Adapter (required):** nuqs needs a `NuqsAdapter` wrapping the tree that uses its hooks. Use the Next.js App Router adapter in the **root layout** so all routes can use nuqs.

In `src/app/layout.tsx`, wrap the main content with `NuqsAdapter`:

```tsx
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html ...>
      <body>
        <NuqsAdapter>
          <Suspense fallback={<RootLayoutFallback />}>
            <RootLayoutContent>{children}</RootLayoutContent>
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
```

`NuqsAdapter` is a client component; the layout remains a Server Component and simply renders it. Do **not** put the adapter inside `Providers` unless you intentionally restrict nuqs to the dashboard; placing it in the root layout allows any page (including `/app/admin`) to use `useQueryState` / `useQueryStates`.

## 2. Where to put parsers and hooks

**Option A – Feature-scoped (recommended for admin lists)**

Keep parsers and URL-driven state next to the feature that uses them:

- **Admin users**: `src/features/admin/lib/search-params.ts` (parsers) and use `useQueryStates` in `UserManagement` or a small `AdminUsersFilters` component.
- **Admin sessions / API keys / OAuth clients**: same idea, or one shared `admin-list-search-params.ts` if you want one schema for “current tab + shared pagination”.

**Option B – Shared nuqs helpers**

If multiple areas need similar patterns (e.g. “list with limit/offset and filters”):

- `src/shared/nuqs/parsers.ts` – generic parsers (e.g. `parseAsInteger.withDefault(50)`, `parseAsStringLiteral`) reused across features.
- Per-feature descriptors still live in the feature (e.g. `features/admin/lib/search-params.ts`) and import from `@/shared/nuqs/parsers` when useful.

Prefer **Option A** until you have a second feature that clearly shares the same URL shape; then extract shared bits into `@/shared/nuqs/`.

## 3. Define parsers for admin list filters

Admin API routes already accept `role`, `banned`, `search`, `limit`, `offset` (and similar for sessions/api-keys/oauth-clients). Mirror that in nuqs so the client reads/writes the same keys.

Example for **users** in `src/features/admin/lib/search-params.ts`:

```ts
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

// Reuse this object in useQueryStates() on the client (import from "nuqs").
export const usersListParsers = {
  role: parseAsStringLiteral(["user", "staff", "admin"]).withDefault("user"),
  banned: parseAsBoolean.withDefault(false),
  search: parseAsString.withDefault(""),
  limit: parseAsInteger.withDefault(100),
  offset: parseAsInteger.withDefault(0),
} as const;
```

The resulting state matches `UserListFilters`: pass it into `useUsers(filters)` with minimal mapping (e.g. omit `search` when empty, or pass `urlState` as-is if your API accepts the same shape).

## 4. Use nuqs in admin UI

**Option 1 – In `UserManagement` (or equivalent)**: use the `useUsersListSearchParams()` hook (wraps `useQueryStates(usersListParsers)`) and pass the derived filters into `useUsers(filters)`. Wire inputs (Select, Input, etc.) to the setter so changes update the URL; TanStack Query will refetch when the key from `queryKeys.users.list(filters)` changes. All components that call `useUsersListSearchParams()` share the same URL keys and stay in sync (see [nuqs tips & tricks – reusing hooks](https://nuqs.dev/docs/tips-tricks#reusing-hooks)).

**Option 2 – Small filter bar component**: e.g. `AdminUsersFilters` that uses `useUsersListSearchParams()` and renders the controls, and a parent that reads the same state and passes it to `useUsers`. Prefer one call to the hook in the component that also calls `useUsers`, to avoid drift.

Use `{ shallow: false }` (or the nuqs default for your adapter) when you want navigation that triggers server re-renders (e.g. so the admin page’s Server Component can prefetch with the same params). Use `shallow: true` only when you want client-only updates.

## 5. Server-side prefetch (optional)

Today the admin page prefetches with fixed `limit: 100`. If you want the initial HTML to respect URL params (e.g. `?role=admin&search=foo`), you can:

- In `src/features/admin/lib/search-params.ts`, define the same descriptor and call `createLoader(usersListParsers)` (or use `createSearchParamsCache` if you need params in nested Server Components).
- In the admin **page** (Server Component), await `loadSearchParams(searchParams)` (or `searchParamsCache.parse(searchParams)`), map the result to `UserListFilters`, and pass it into `queryClient.prefetchQuery({ queryKey: queryKeys.users.list(filters), ... })`.

Then the client’s `useUsers(filters)` will hydrate from that prefetch when the key matches. Keep the parser descriptor in one place (e.g. `search-params.ts`) and import it in both the server loader and the client `useQueryStates` so types stay in sync.

## 6. Limits and URL length

- nuqs throttles URL updates (default 50ms; Safari uses 120ms+). Custom throttle/debounce: see [Rate-limiting URL updates](https://nuqs.dev/docs/options#rate-limiting-url-updates). Our admin search input uses per-call `debounce(500)` for typing.
- Browsers cap URL length (~2 MB Chrome, ~2k chars practical before issues; Safari/IE lower). Social and email clients often truncate long URLs. Keep URL state small; if you approach ~2k characters, prefer other state (e.g. session or DB) for heavy payloads.
- For building links (e.g. “Copy filter link”, pre-filled `<Link>` hrefs), use [createSerializer](https://nuqs.dev/docs/utilities#serializer-helper) with the same parsers (and optional `urlKeys`).
- **SEO:** When query params are local-only (filters, view state), set `metadata.alternates.canonical` to the path *without* the query string so crawlers index the base URL. The admin page does this in `generateMetadata`. If the query string defines the content (e.g. watch?v=), canonical should include relevant params—use parsers + `createSerializer` to build it. See [nuqs SEO](https://nuqs.dev/docs/seo).

## 7. Scoping and naming

- Admin list params live under `/app/admin`; keys like `role`, `search`, `limit`, `offset` are fine and won’t clash with other routes.
- If you add nuqs to more areas (e.g. integrations list, audit log), use distinct key names or prefixes per feature (e.g. `usersRole` vs `sessionsActive`) if they ever share a layout.
- For “tab” state (Users / Sessions / API keys / OAuth clients), you can use a literal parser, e.g. `parseAsStringLiteral(["users", "sessions", "api-keys", "oauth-clients"]).withDefault("users")`, and drive the visible panel from that.

## 8. Testing and accessibility

- **Tests**: Use `NuqsTestingAdapter` (see [nuqs testing](https://nuqs.dev/docs/testing)) in tests that render components using `useQueryState` / `useQueryStates`, and set initial query string via the adapter.
- **Keyboard / screen readers**: Filter controls that update the URL are normal inputs and buttons; keep labels, roles, and live regions as you would for any filter UI.

## 9. Alignment with existing patterns

- **TanStack Query**: nuqs only owns URL state. Continue using `queryKeys.users.list(filters)` and existing hooks; the only change is that `filters` comes from `useQueryStates(...)` instead of constants or local state.
- **Prefetch/hydrate**: Keep using `getServerQueryClient()`, `prefetchQuery`, and `HydrationBoundary` on the admin page; if you add a loader, prefetch using the same `UserListFilters` you get from the loader so keys match.
- **API routes**: No change. They already read `searchParams` from `request.url`; the client will send the same params once filters are driven by the URL via nuqs.
- **Routing/i18n**: nuqs works with next-intl and Next.js App Router; the adapter uses the default navigation stack. No need to change locale or routing setup.

## 10. Checklist

1. `pnpm add nuqs`
2. In `src/app/layout.tsx`, wrap body content with `<NuqsAdapter>` from `nuqs/adapters/next/app`.
3. Add `src/features/admin/lib/search-params.ts` with parsers for users (and optionally sessions/api-keys/oauth) matching `UserListFilters` / `SessionListFilters` etc.
4. In `UserManagement` (or an `AdminUsersFilters` + parent), use `useUsersListSearchParams()` and pass the derived `filters` into `useUsers(filters)`.
5. Wire filter UI (role, banned, search, limit, offset) to the nuqs setters so the URL updates.
6. (Optional) Add `createLoader(usersListParsers)` and use it in the admin page to prefetch with URL-derived filters.
7. (Optional) Add tab parsing and drive Users/Sessions/API keys/OAuth panels from a single `tab` param.

## References

- [nuqs docs](https://nuqs.dev/docs) – installation, adapters, parsers, options
- [nuqs Next.js adapter](https://nuqs.dev/docs/adapters#nextjs-app-router) – `NuqsAdapter` in root layout
- [nuqs server-side](https://nuqs.dev/docs/server-side) – `createLoader`, `createSearchParamsCache`
- [nuqs batching](https://nuqs.dev/docs/batching) – `useQueryStates` and descriptors
- [nuqs limits](https://nuqs.dev/docs/limits) – URL throttling, max URL length
- [nuqs utilities](https://nuqs.dev/docs/utilities) – `createSerializer`, `inferParserType`, Standard Schema
- [nuqs SEO](https://nuqs.dev/docs/seo) – canonical URL for local-only vs content-defining query params
- [nuqs tips & tricks](https://nuqs.dev/docs/tips-tricks) – reusing hooks, shared state across components
