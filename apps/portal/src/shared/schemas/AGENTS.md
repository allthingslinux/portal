# src/shared/schemas

> ⚠️ **Moved to `packages/schemas/` (`@portal/schemas`)**
>
> Shared Zod validation schemas have been extracted to the `@portal/schemas` workspace package as part of the Turborepo migration.

## Where Things Live Now

| What | Old Location | New Location |
|------|-------------|-------------|
| User schemas | `src/shared/schemas/user.ts` | `packages/schemas/src/user.ts` |
| Schema utils | `src/shared/schemas/utils.ts` | `packages/schemas/src/utils.ts` |
| Integration schemas | `src/shared/schemas/integrations/` | `packages/schemas/src/integrations/` |
| Barrel export | `src/shared/schemas/index.ts` | `packages/schemas/src/index.ts` |

## Usage

```typescript
import { updateUserSchema } from "@portal/schemas/user"

// API Route Validation
const parsed = updateUserSchema.safeParse(body)

// React Hook Form
import { zodResolver } from "@hookform/resolvers/zod"
const form = useForm({ resolver: zodResolver(updateUserSchema) })
```

## Critical Rules

- **Always use `safeParse`** in API routes (not `parse`) — handle errors gracefully, don't throw.
- **Never use raw `req.json()` data** without first passing it through a schema.
- **Shared schemas go in `@portal/schemas`** — feature-specific schemas stay in the feature.
- **Keep schema files isomorphic** — no server-only imports.
