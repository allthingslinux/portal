# Architecture Documentation

This document provides a comprehensive overview of Portal's architecture, module organization, and design patterns.

## Table of Contents

- [Module Boundaries](#module-boundaries)
- [Server/Client Code Separation](#serverclient-code-separation)
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
│   ├── admin/              # Admin-specific components
│   └── integrations/       # Integration-specific components
├── lib/                    # Core business logic
│   ├── auth/               # Authentication module
│   ├── db/                 # Database configuration
│   ├── api/                # API client utilities
│   ├── integrations/       # Integration framework
│   └── utils/              # Shared utilities
└── hooks/                  # Custom React hooks
```

### When to Add Modules

**Add to `src/lib/` when:**

- Creating reusable business logic
- Adding new integrations or services
- Implementing shared utilities
- Defining database schemas
- Creating API helpers

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
- Auth utilities (`src/lib/auth/server-client.ts`)
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

## Integration Framework

Portal uses a registry pattern for integrations:

### Architecture

- **Registry**: `src/lib/integrations/registry.ts` - Central registry for all integrations
- **Factory**: Integration factory for creating instances
- **Base Class**: `BaseIntegration` provides common functionality
- **Registration**: Integrations register themselves on module load

### Adding a New Integration

1. **Create integration module** in `src/lib/integrations/[name]/`

   ```
   src/lib/integrations/xmpp/
   ├── index.ts          # Integration implementation
   ├── keys.ts           # Environment variables
   └── types.ts          # Type definitions
   ```

2. **Implement `BaseIntegration` interface**

   ```typescript
   import { BaseIntegration } from "@/lib/integrations/base"
   
   export class XmppIntegration extends BaseIntegration {
     id = "xmpp"
     name = "XMPP"
     // Implement required methods
   }
   ```

3. **Register in `src/lib/integrations/index.ts`**

   ```typescript
   import { registerXmpp } from "./xmpp"
   
   export function registerIntegrations() {
     registerXmpp()
     // Other integrations...
   }
   ```

4. **Add environment variables** in `keys.ts`

   ```typescript
   export const keys = () =>
     createEnv({
       server: {
         XMPP_DOMAIN: z.string().optional(),
         // ...
       },
     })
   ```

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
import { APIError } from "@/lib/api/utils"

throw new APIError("Resource not found", 404)
```

**Use `handleAPIError()` wrapper:**

```typescript
import { handleAPIError } from "@/lib/api/utils"

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
import { requireAuth } from "@/lib/api/utils"

const { userId, session } = await requireAuth(request)
```

**`requireAdmin()`** - Requires admin role:

```typescript
import { requireAdmin } from "@/lib/api/utils"

const { userId, session } = await requireAdmin(request)
```

**`requireAdminOrStaff()`** - Requires admin or staff role:

```typescript
import { requireAdminOrStaff } from "@/lib/api/utils"

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

Granular permissions are available via `src/lib/auth/permissions.ts`:

```typescript
import { checkPermission } from "@/lib/auth/permissions"

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

**2. Separated Structure** (for larger features):

```
src/
├── components/admin/
│   └── user-management.tsx
├── app/api/admin/users/
│   └── route.ts
└── hooks/
    └── use-admin.ts
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

- Core modules (`@/auth`, `@/db`)
- Small utility modules
- Frequently imported modules

**Use direct imports for:**

- UI components (performance)
- Large modules (tree-shaking)
- One-off imports

## Database Conventions

### Schema Organization

**Modular schemas** in `src/lib/db/schema/`:

- One file per domain (`auth.ts`, `oauth.ts`, `api-keys.ts`)
- Relations defined in `relations.ts`
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

## Related Documentation

- [API Documentation](./API.md) - REST API endpoints
- [Component Conventions](./COMPONENTS.md) - UI component guidelines
- [Testing Guide](./TESTING.md) - Testing patterns
- [Integration Framework](./INTEGRATIONS.md) - Integration development
