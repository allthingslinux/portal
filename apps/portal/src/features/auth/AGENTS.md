# src/features/auth

> Scope: Authentication feature — UI pages, session management, permissions, and client-side auth logic.

## What Lives Here

| Directory | Purpose |
|-----------|---------|
| `lib/` | BetterAuth server config, client, DAL, permissions, session context |
| `components/` | Auth UI components (forms, providers) |
| `hooks/` | Auth-specific React hooks |
| `api/` | Auth-related API route handlers |

Key files in `lib/`:
- `config.ts` — BetterAuth server configuration (plugins, email, OAuth providers)
- `client.ts` — BetterAuth client (`authClient`) — import this in client components
- `server-client.ts` — Server-side auth client
- `dal.ts` — Data Access Layer for auth (server-only, wraps DB queries)
- `permissions.ts` — Permission check helpers (`checkPermission`, guards)
- `session-context.tsx` — React context providing session to client components
- `keys.ts` — Auth env vars (`keys()` function via t3-env)
- `localization.ts` — BetterAuth i18n setup
- `email.ts` — Transactional email for auth flows (verification, password reset)

## BetterAuth v1.5+ Notes

- **API Key plugin** is now a separate package: `@better-auth/api-key` (moved out of core `better-auth`)
- **API Key schema changes**: `userId` → `referenceId`, new `configId` field (see `@portal/db` schema)
- **Auth schema generation**: `pnpm auth:init-schema` outputs to `packages/db/src/schema/auth-schema.ts`. The CLI may fail due to `server-only` imports in the config chain — apply schema changes manually if needed by referencing the BetterAuth source on GitHub.

## Auth Flow

```
Login page → BetterAuth email/OAuth → Email verification → Dashboard
```

## Usage Patterns

### Server-side (route handlers, server actions, server components)
```typescript
import { auth } from "@/auth"

const session = await auth.api.getSession({ headers: await headers() })
if (!session) redirect("/auth/login")
```

### Client-side (client components)
```typescript
import { authClient } from "@/auth"

const { data: session, isPending } = authClient.useSession()
```

### Permissions

```typescript
// Client
import { usePermissions } from "@/auth"
const { hasPermission } = usePermissions()
if (!hasPermission("admin:read")) return null

// Server
import { checkPermission } from "@/features/auth/lib/permissions"
await checkPermission(session.user, "admin:read")
```

## Critical Rules

- **Never bypass BetterAuth** with raw DB queries for session/user lookups — use `dal.ts` helpers.
- **Never import `config.ts` or `dal.ts` in client components** — they are server-only.
- **Use `session-context.tsx`** to share session data in client component trees — don't lift from cookies directly.
- Permission values are defined in `@portal/types/auth` (`Permission`) — don't hardcode strings.
