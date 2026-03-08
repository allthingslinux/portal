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

- **Update profile**: Mutation → POST to `src/app/api/users/[id]` → invalidate `queryKeys.users.current()`
- **Change password**: Goes through BetterAuth (`authClient.changePassword()`) — not a custom API
- **API Keys**: Managed via `src/app/api/users/[id]/api-keys/` routes

## Critical Rules

- **Users cannot change their own role** — role changes are admin-only operations.
- **Password changes go through BetterAuth**, never through a custom route.
- **Validate all profile update inputs** with Zod schemas from `@portal/schemas/user` before sending to the API.
