# src/features/user

> Scope: User profile, settings, and self-service account management UI.

## What Lives Here

| Directory | Purpose |
|-----------|---------|
| `lib/` | User-specific business logic |
| `components/` | Profile and settings UI components |
| `hooks/` | TanStack Query hooks for user data |

## Data Patterns

User data flows through the DTO layer — never expose raw Drizzle query results to the UI:

```typescript
import type { UserDTO } from "@/types/common"

// Hooks return typed DTOs
const { data: user } = useCurrentUser() // returns UserDTO | undefined
```

## TanStack Query

User query keys are defined in the factory at `@/shared/api/query-keys`:

```typescript
import { queryKeys } from "@/shared/api/query-keys"
queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
```

## Common Tasks

- **Update profile**: Mutation → POST to `src/app/api/users/[id]` → invalidate `queryKeys.users.current()`
- **Change password**: Goes through BetterAuth (`authClient.changePassword()`) — not a custom API
- **API Keys**: Managed via `src/app/api/users/[id]/api-keys/` routes

## Critical Rules

- **Users cannot change their own role** — role changes are admin-only operations.
- **Password changes go through BetterAuth**, never through a custom route.
- **Validate all profile update inputs** with Zod schemas from `src/shared/schemas/user.ts` before sending to the API.
