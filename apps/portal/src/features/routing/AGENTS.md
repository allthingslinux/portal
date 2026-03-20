# src/features/routing

> Scope: Route configuration, middleware, breadcrumbs, permission-based route guards, and i18n routing.

## What Lives Here

| File | Purpose |
|------|---------|
| `lib/config.ts` | Route definitions — all app routes declared here |
| `lib/permissions.ts` | Route-level permission guards |
| `lib/breadcrumbs.ts` | Breadcrumb generation from route config |
| `lib/i18n.ts` | next-intl routing config and locale handling |
| `lib/i18n-utils.ts` | i18n utility helpers |
| `lib/ui.ts` | Route-related UI helpers (active link detection, etc.) |
| `lib/types.ts` | Route types (`RouteConfig`, `ProtectedRoute`, etc.) |
| `lib/README.md` | Detailed routing architecture documentation |

## Middleware

> ⚠️ The Next.js middleware file is **`src/proxy.ts`**, not `middleware.ts`.

The middleware handles:

1. Authentication redirects (unauthenticated → login)
2. Role-based route protection
3. Locale detection and routing (next-intl)

## Route Config Pattern

All routes are declared in `lib/config.ts`:

```typescript
import { type RouteConfig } from "@portal/types/routes"

// Public routes — no auth required
// Protected routes — require session + optional role check
// Admin routes — require ADMIN role
```

## Breadcrumbs

Breadcrumbs are **generated from the route config** via `generateBreadcrumbs` — don't hardcode trail logic in page components:

```typescript
import { generateBreadcrumbs, routeConfig } from "@/features/routing/lib"

const crumbs = generateBreadcrumbs(pathname, routeConfig, resolver)
```

Dashboard pages often use `@portal/ui` `PageHeader` with `pathname` + `getServerRouteResolver()` instead of assembling crumbs manually.

## i18n

Supported locales: `en`, `es`, `fr`, `de`, `pt`, `zh` (defined in `src/i18n/`). Locale files in `locale/`. Use `next-intl` hooks:

```typescript
import { useTranslations } from "next-intl"
const t = useTranslations("common")
```

## Critical Rules

- **Route config is the single source of truth** — add new routes to `lib/config.ts` first, then create the page.
- **Middleware is `src/proxy.ts`** — never rename it to `middleware.ts`; Sentry instrumentation depends on this.
- **Never hardcode permission checks in layouts/pages** — use route-config guards so they're centrally managed.
- **Read `lib/README.md`** before making structural changes to the routing layer.
