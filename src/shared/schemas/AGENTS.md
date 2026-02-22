# src/shared/schemas

> Scope: Shared Zod validation schemas used across API routes, server actions, and forms.

## What Lives Here

| File | Purpose |
|------|---------|
| `user.ts` | User validation schemas (profile update, ban input, role assignment) |
| `utils.ts` | Schema utility helpers (custom refinements, transformers) |
| `integrations/` | Integration-specific schemas (IRC account creation, XMPP setup) |
| `index.ts` | Barrel export for shared schemas |

## Convention

- **Shared schemas go here** — schemas used by more than one feature or by both a route handler and a form.
- **Feature-specific schemas stay in the feature** — if a schema is only used in `features/admin/`, keep it there.
- **API route handlers import from here** for request body validation.
- **React Hook Form** integrations use `zodResolver(schema)` from these files.

## Usage Patterns

### API Route Validation

```typescript
import { updateUserSchema } from "@/shared/schemas/user"

export async function PATCH(req: Request) {
  const body = await req.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  // Use parsed.data — fully typed and safe
}
```

### Form Validation (React Hook Form)

```typescript
import { zodResolver } from "@hookform/resolvers/zod"
import { updateUserSchema } from "@/shared/schemas/user"

const form = useForm({
  resolver: zodResolver(updateUserSchema),
})
```

## Critical Rules

- **Always use `safeParse`** in API routes (not `parse`) — handle errors gracefully, don't throw.
- **Never use raw `req.json()` data** without first passing it through a schema.
- **Date fields** (like `banExpires`) must use refined schemas that reject invalid `Date` objects — see `utils.ts` for the `validDate` helper.
- **Don't import these schemas in server-only modules** if they include client-facing error messages — keep schema files isomorphic (no server-only imports).
