# Architecture Documentation

This document provides a comprehensive overview of Portal's architecture, module organization, and design patterns.

## Table of Contents

- [Module Boundaries](#module-boundaries)
- [Server/Client Code Separation](#serverclient-code-separation)
- [Data Fetching & RSC](#data-fetching--rsc)
- [Integration Framework](#integration-framework)
- [API Design Conventions](#api-design-conventions)
- [Auth Guard Patterns](#auth-guard-patterns)
- [Feature Module Conventions](#feature-module-conventions)
- [Database Conventions](#database-conventions)

## Module Boundaries

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── api/                # API route handlers
│   └── auth/               # Authentication pages
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui base components
│   ├── layout/             # Layout components
│   ├── admin/              # Admin-specific components (if colocated)
│   └── integrations/       # Integration-specific components (if colocated)
├── features/               # Feature modules (auth, admin, integrations, routing)
│   ├── auth/lib/           # Auth DAL, config, permissions (@/auth)
│   ├── integrations/lib/  # Integration framework (registry, XMPP, etc.)
│   └── routing/lib/       # Route config, breadcrumbs
├── shared/                 # Shared utilities and infrastructure
│   ├── api/                # Query client, server-queries, utils (@/shared/api)
│   ├── db/                 # Database client and schema (@/db)
│   ├── observability/      # Logging, Sentry, wide events
│   └── utils/              # Constants, cn(), date helpers
└── hooks/                  # Custom React hooks
```

### When to Add Modules

**Add to `src/shared/` or `src/features/` when:**

- Creating reusable business logic (shared) or feature-specific logic (features)
- Adding new integrations or services (`src/features/integrations/lib/`)
- Implementing shared utilities (`src/shared/utils/`)
- Defining database schemas (`src/shared/db/schema/`)
- Creating API helpers (`src/shared/api/`)

**Add to `src/components/` when:**

- Creating reusable UI components
- Building feature-specific components
- Adding layout components
- Creating admin interfaces

**Add to `src/hooks/` when:**

- Creating custom React hooks
- Wrapping TanStack Query queries
- Adding UI interaction hooks
- Creating data fetching hooks

**Add to `src/app/api/` when:**

- Creating REST API endpoints
- Adding server-side handlers
- Implementing webhooks
- Creating public endpoints

## Server/Client Code Separation

### Server-Only Code

**Mark with:**

- `"use server"` directive for Server Actions
- `import "server-only"` for server-only modules

**Examples:**

- API route handlers (`src/app/api/`)
- Server Actions
- Database queries
- Auth utilities (`@/auth` – `src/features/auth/lib/`, e.g. server-client)
- Server-side configuration

**Pattern:**

```typescript
import "server-only"
import { auth } from "@/auth"
import { db } from "@/db"

export async function getServerData() {
  const session = await auth.api.getSession()
  // Server-only code
}
```

### Client Code

**Mark with:**

- `"use client"` directive for Client Components

**Examples:**

- React components with interactivity
- Client-side hooks
- Browser APIs (localStorage, window)
- Client-side state management

**Pattern:**

```typescript
"use client"
import { authClient } from "@/auth/client"
import { useState } from "react"

export function ClientComponent() {
  const { data: session } = authClient.useSession()
  // Client-side code
}
```

### Best Practices

1. **Keep server code out of client bundles**
   - Never import server-only modules in client components
   - Use API routes or Server Actions for server operations

2. **Minimize client-side code**
   - Move business logic to server when possible
   - Keep client components focused on UI

3. **Clear boundaries**
   - Use TypeScript to catch server/client boundary violations
   - Document server-only modules clearly

### Data Fetching & RSC

**When to use what**

- **Server Components (default):** Use for rendering that doesn’t need state, event handlers, `useEffect`, or browser APIs. Prefer Server Components so more of the tree stays on the server and stays out of the client bundle.
- **Client Components (`"use client"`):** Use when you need interactivity, `useState`/`useEffect`, React Context, or browser APIs (e.g. `localStorage`, `window`).

**Server-side data**

- **DAL + `React.cache()`:** Auth/session helpers (`verifySession`, `getUser`, etc.) in the Data Access Layer use `React.cache()` for request-scoped memoization. DB and env access stay in server-only modules.
- **Server-queries:** Prefetch/fetch in Server Components uses `getServerQueryClient()` and server-only fetchers (e.g. `src/shared/api/server-queries.ts`). No DB access in client code.

**Client-side data**

- **React Query:** Client components that need mutations, refetch, or shared cache call `/api/*` via TanStack Query hooks. Use the shared query key factory (`src/shared/api/query-keys.ts`) so prefetch and client hooks share the same keys.

**Hybrid pattern (prefetch + hydrate)**

- In a Server Component: create a per-request `QueryClient`, call `prefetchQuery` (or `fetchQuery`) with the **same query keys** as the client hooks, then render `<HydrationBoundary state={dehydrate(queryClient)}>` wrapping the client subtree.
- Client components use `useQuery`/`useSuspenseQuery` with those keys and receive the prefetched data without a loading round-trip. Keep the query key factory in sync between server prefetch and client hooks (e.g. admin users list `limit` must match between admin page prefetch and `UserManagement`).

**Decision rule**

- Prefer server fetch or prefetch for initial/SEO-critical data.
- Use React Query on the client when you need mutations, `invalidateQueries`, or client-driven filters/pagination.

**Caching layers**

| Layer                   | Scope                         | Where                                                                 |
| ----------------------- | ----------------------------- | --------------------------------------------------------------------- |
| React `cache()`         | Request (single render pass)  | DAL `verifySession`, `getUser`, etc.                                  |
| `"use cache"`           | Persistent (cacheLife/cacheTag) | `getStaticRouteMetadataCached` in `src/shared/seo/metadata.ts` only   |
| TanStack Query (server) | Per-request `QueryClient`     | Prefetch in Server Components, then dehydrate                         |
| TanStack Query (client)  | Singleton `QueryClient`       | Hooks in Client Components, hydrated from server                      |

## Integration Framework

Portal uses a registry pattern for integrations. The framework lives under `src/features/integrations/lib/`.

### Architecture

- **Registry**: `src/features/integrations/lib/core/registry.ts` – Central registry for all integrations
- **Factory**: `src/features/integrations/lib/core/factory.ts` – Utility for accessing integrations by id
- **Base/Types**: `src/features/integrations/lib/core/` – Base class, types, constants
- **Registration**: Integrations register themselves via `getIntegrationRegistry().register()` (e.g. in XMPP implementation)

### Adding a New Integration

1. **Create integration module** in `src/features/integrations/lib/[name]/`

   ```
   src/features/integrations/lib/xmpp/
   ├── index.ts           # Public exports, registration
   ├── implementation.ts   # Integration class extending base
   ├── keys.ts            # Environment variables (t3-env)
   ├── config.ts          # Configuration
   ├── types.ts           # Integration-specific types
   └── client.ts          # External service client (if needed)
   ```

2. **Implement the integration interface** (see `src/features/integrations/lib/core/types.ts`)

   ```typescript
   import type { Integration } from "@/features/integrations/lib/core/types"
   
   export const xmppIntegration: Integration = {
     id: "xmpp",
     name: "XMPP",
     // Implement required methods
   }
   ```

3. **Register in your implementation** (e.g. call `getIntegrationRegistry().register(xmppIntegration)` from the module that creates the instance), and ensure `registerIntegrations()` is called where integrations are used (API routes, etc.).

4. **Add environment variables** in the integration’s `keys.ts`, and extend `src/env.ts` with that module’s keys.

### Integration Lifecycle

1. **Registration**: Integrations register on module load
2. **Discovery**: Registry provides list of available integrations
3. **Instantiation**: Factory creates integration instances
4. **Usage**: Components and API routes use integrations

See [docs/INTEGRATIONS.md](./INTEGRATIONS.md) for detailed integration documentation.

## API Design Conventions

### Response Format

**Success Response:**

```typescript
Response.json({ ok: true, data: {...} })
```

**Error Response:**

```typescript
Response.json({ ok: false, error: "Error message" }, { status: 400 })
```

### Error Handling

**Use `APIError` class:**

```typescript
import { APIError } from "@/shared/api/utils"

throw new APIError("Resource not found", 404)
```

**Use `handleAPIError()` wrapper:**

```typescript
import { handleAPIError } from "@/shared/api/utils"

try {
  // API logic
} catch (error) {
  return handleAPIError(error)
}
```

**Error Handling Flow:**

1. Catch errors in route handlers
2. Use `APIError` for known errors
3. Let `handleAPIError()` handle unknown errors
4. Errors are automatically logged to Sentry

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Request Validation

**Use Zod for validation:**

```typescript
import { z } from "zod"

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const body = bodySchema.parse(await request.json())
```

### Data Transfer Objects (DTOs)

**Always use DTOs to prevent exposing sensitive data:**

```typescript
const userData = await db
  .select({
    id: user.id,
    name: user.name,
    email: user.email,
    // Only select needed fields
  })
  .from(user)
```

See [docs/API.md](./API.md) for complete API documentation.

## Auth Guard Patterns

### Available Guards

**`requireAuth()`** - Requires any authenticated user:

```typescript
import { requireAuth } from "@/shared/api/utils"

const { userId, session } = await requireAuth(request)
```

**`requireAdmin()`** - Requires admin role:

```typescript
import { requireAdmin } from "@/shared/api/utils"

const { userId, session } = await requireAdmin(request)
```

**`requireAdminOrStaff()`** - Requires admin or staff role:

```typescript
import { requireAdminOrStaff } from "@/shared/api/utils"

const { userId, session } = await requireAdminOrStaff(request)
```

### Usage Pattern

```typescript
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    // Protected logic here
    return Response.json({ ok: true, data })
  } catch (error) {
    return handleAPIError(error)
  }
}
```

### Role-Based Access Control

Portal uses three roles:

- **`user`** - Regular user
- **`staff`** - Staff member (admin or staff guard)
- **`admin`** - Administrator (admin guard only)

### Permission System

Granular permissions are available via `@/auth/permissions` (`src/features/auth/lib/permissions.ts`):

```typescript
import { checkPermission } from "@/auth/permissions"

const canManageUsers = await checkPermission(userId, "user:manage")
```

## Feature Module Conventions

### When to Create a Feature Module

Create a feature module when:

- Feature has multiple related components
- Feature has its own API routes
- Feature has complex business logic
- Feature needs isolation

### Module Structure Patterns

**1. Colocated Structure** (for tightly coupled features):

```
src/components/admin/
├── user-management.tsx      # Component
├── user-management.test.tsx # Tests
└── user-columns.tsx         # Related utilities
```

**When to colocate:**

- ✅ Components and their tests
- ✅ Related utility functions
- ✅ Type definitions used only by the feature
- ✅ Small, focused features (< 5 files)

**2. Separated Structure** (for larger features). Portal uses this for admin and integrations:

```
src/
├── features/admin/
│   ├── components/       # user-management, data-table, etc.
│   ├── hooks/            # use-admin, use-admin-actions
│   └── api/              # API client helpers
├── app/api/admin/users/
│   └── route.ts
└── hooks/
    └── use-permissions.ts   # Shared across features
```

**When to separate:**

- ✅ Features spanning multiple concerns (UI, API, hooks)
- ✅ Shared utilities used across features
- ✅ Large features (> 5 files)
- ✅ Features with clear boundaries (admin, integrations)

### Naming Conventions

- **Files**: Use kebab-case (`user-management.tsx`)
- **Components**: Use PascalCase (`UserManagement`)
- **Functions/Variables**: Use camelCase (`getUserData`)
- **Constants**: Use UPPER_CASE (`MAX_USERS`)
- **Types/Interfaces**: Use PascalCase (`UserData`)

### Import Patterns

**Prefer direct imports for performance:**

```typescript
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

**Use barrel exports for core modules:**

```typescript
import { auth } from "@/auth"
import { db } from "@/db"
```

**Group imports:**

```typescript
// External dependencies
import { useState } from "react"
import { z } from "zod"

// Internal modules
import { auth } from "@/auth"
import { db } from "@/db"

// UI components
import { Button } from "@/components/ui/button"

// Relative imports
import { UserCard } from "./user-card"
```

### Barrel Exports vs Direct Imports

**Use barrel exports for:**

- Core modules (`@/auth`, `@/db`, `@/config`)
- Small utility modules
- Frequently imported modules

**Use direct imports for:**

- UI components (performance)
- Large modules (tree-shaking)
- One-off imports

## Database Conventions

### Schema Organization

**Modular schemas** in `src/shared/db/schema/` (and `@/db/schema/`):

- One file per domain (`auth.ts`, `oauth.ts`, `api-keys.ts`, `integrations/base.ts`)
- Relations defined in `src/shared/db/relations.ts`
- Use Drizzle ORM for type-safe queries

### Migrations

**Generate migrations:**

```bash
pnpm db:generate
```

**Run migrations:**

```bash
pnpm db:migrate
```

**Best practices:**

- Review generated SQL before committing
- Never edit migration files manually after generation
- Test migrations on staging before production
- Always backup production database before migrations

### Query Patterns

**Use DTOs to select only needed fields:**

```typescript
const users = await db
  .select({
    id: user.id,
    name: user.name,
    email: user.email,
  })
  .from(user)
```

**Avoid selecting entire tables:**

```typescript
// ❌ Bad
const users = await db.select().from(user)

// ✅ Good
const users = await db
  .select({
    id: user.id,
    name: user.name,
  })
  .from(user)
```

**Use transactions for multi-step operations:**

```typescript
await db.transaction(async (tx) => {
  await tx.insert(user).values({...})
  await tx.insert(session).values({...})
})
```

**Handle errors gracefully:**

```typescript
try {
  const result = await db.select().from(user)
} catch (error) {
  // Handle database errors
  log.error("Database query failed", error)
  throw new APIError("Failed to fetch users", 500)
}
```

## Best Practices Summary

1. **Clear Module Boundaries**
   - Keep related code together
   - Separate concerns (UI, API, business logic)
   - Use consistent naming conventions

2. **Server/Client Separation**
   - Mark server-only code explicitly
   - Keep client bundles small
   - Use API routes for server operations

3. **Type Safety**
   - Use TypeScript strict mode
   - Define types for all data structures
   - Use Zod for runtime validation

4. **Error Handling**
   - Use consistent error patterns
   - Log errors to Sentry
   - Return user-friendly error messages

5. **Code Organization**
   - Follow established patterns
   - Document complex logic
   - Keep files focused and small

6. **Performance**
   - Use direct imports for UI components
   - Select only needed database fields
   - Cache expensive operations

## Related documentation

- [docs/README.md](./README.md) — Index of all project docs
- [API Documentation](./API.md) — REST API endpoints and route param validation
- [Component Conventions](./COMPONENTS.md) — UI component guidelines
- [Testing Guide](./TESTING.md) — Testing patterns (Vitest, RTL)
- [Integration Framework](./INTEGRATIONS.md) — Adding and implementing integrations
- [PATH_ALIASES.md](./PATH_ALIASES.md) — TypeScript path aliases and targets
