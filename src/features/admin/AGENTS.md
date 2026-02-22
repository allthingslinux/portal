# src/features/admin

> Scope: Admin dashboard — user management, ban management, role management, and system statistics.

## What Lives Here

| Directory | Purpose |
|-----------|---------|
| `lib/` | Admin business logic and server utilities |
| `components/` | Admin UI components (data tables, forms, modals) |
| `hooks/` | Admin-specific TanStack Query hooks |
| `api/` | Admin API route handler wrappers |

## Architecture

Admin features follow the standard portal feature pattern:
- **API routes** live in `src/app/api/admin/` (not here)
- **Server queries** that need elevated access are in `src/shared/api/server-queries.ts`
- **Client data fetching** goes through TanStack Query hooks in `hooks/`

## Permission Model

All admin functionality requires explicit permission checks. **Never render admin UI or execute admin actions without verifying the user's role.**

```typescript
// Server-side — in route handlers or server actions
import { auth } from "@/auth"
import { USER_ROLES } from "@/lib/utils/constants"

const session = await auth.api.getSession({ headers: await headers() })
if (session?.user.role !== USER_ROLES.ADMIN) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// Client-side — in components
import { usePermissions } from "@/hooks/use-permissions"
const { hasPermission } = usePermissions()
// Gate entire components: if (!hasPermission("admin:read")) return null
```

## Common Tasks

- **Viewing/editing users**: Query keys in `@/lib/api/query-keys` under `users.*`
- **Ban management**: Uses `banExpires` date field — validated via Zod schema in `src/shared/schemas/user.ts`
- **Role assignment**: Update `role` field through the admin API, never directly against the DB from the client
- **Stats**: Live stats fetched from `src/app/api/admin/stats/route.ts`

## Critical Rules

- **Every admin mutation must be gated** by a server-side permission check in the route handler — client-side checks are UX only, not security.
- **Never expose raw DB IDs** in admin UI responses — use DTOs from `@/types/common`.
- **Invalidate TanStack Query cache** after mutations using the query key factory — don't optimistically mutate admin data without confirmation.
