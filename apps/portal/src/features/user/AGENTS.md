# src/features/user

> Scope: User profile, settings, and self-service account management UI.

## What Lives Here

| Directory | Purpose |
|-----------|---------|
| `lib/` | User-specific business logic |
| `components/` | Profile and settings UI components |
| `hooks/` | TanStack Query hooks for user data |
| `api/` | User API route handler wrappers |

## Data Patterns

User data flows through the DTO layer — never expose raw Drizzle query results to the UI:

```typescript
import type { UserDTO } from "@portal/types/common"

// Hooks return typed DTOs
const { data: user } = useCurrentUser() // returns UserDTO | undefined
```

## TanStack Query

User query keys are defined in the factory at `@portal/api/query-keys`:

```typescript
import { queryKeys } from "@portal/api/query-keys"
queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
```

## Common Tasks

- **Read / update current user**: `GET` / `PATCH` `app/api/user/me/route.ts` — client helpers in `features/user/api/user.ts`; invalidate `queryKeys.users.current()` after updates
- **Sessions**: `app/api/user/sessions/` and `app/api/user/sessions/[id]/` — list and revoke
- **Change password**: BetterAuth (`authClient.changePassword()`) — not a custom portal route
- **API keys (self-service)**: Better Auth API Key plugin via settings UI; **admin** listing/mutations under `app/api/admin/api-keys/`

## Critical Rules

- **Users cannot change their own role** — role changes are admin-only operations.
- **Password changes go through BetterAuth**, never through a custom route.
- **Validate all profile update inputs** with Zod schemas from `@portal/schemas/user` before sending to the API.
