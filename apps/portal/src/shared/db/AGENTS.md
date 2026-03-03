# src/shared/db

> ⚠️ **Moved to `packages/db/` (`@portal/db`)**
>
> The Drizzle ORM schema, database client, relations, and migration config have been extracted to the `@portal/db` workspace package as part of the Turborepo migration.

## Where Things Live Now

| What | Old Location | New Location |
|------|-------------|-------------|
| DB client | `src/shared/db/client.ts` | `packages/db/src/client.ts` |
| Schema files | `src/shared/db/schema/` | `packages/db/src/schema/` |
| Relations | `src/shared/db/relations.ts` | `packages/db/src/relations.ts` |
| Drizzle Kit config | `src/shared/db/config.ts` | `packages/db/src/config.ts` |
| DB env keys | `src/shared/db/keys.ts` | `packages/db/src/keys.ts` |
| Migrations | `drizzle/` (app root) | `packages/db/drizzle/` |

## Usage

```typescript
import { db } from "@portal/db/client"
import { user, apikey } from "@portal/db/schema"
import { eq } from "drizzle-orm"

const result = await db.select().from(user).where(eq(user.id, userId))
```

## Migration Workflow

All DB commands run from the monorepo root:

```bash
pnpm db:generate   # Generate migration files (runs in @portal/db)
pnpm db:migrate    # Run pending migrations
pnpm db:push       # Push schema directly (dev only, NEVER production)
pnpm db:studio     # Open Drizzle Studio
```

## API Key Schema (BetterAuth v1.5+)

The `apikey` table was updated for BetterAuth v1.5:
- `userId` → `referenceId` (column `user_id` → `reference_id`) — the entity that owns the key
- Added `configId` (column `config_id`, defaults to `"default"`) — multi-config support

## Critical Rules

- **Never use `db:push` in production** — always generate and run migrations.
- **Never use raw SQL** unless Drizzle cannot express the query — document why.
- **Auth tables (`schema/auth.ts`) are BetterAuth-owned** — don't modify columns BetterAuth manages.
- **Always use transactions** for operations that modify multiple tables atomically.
- **Import `db` from `@portal/db/client`** — never instantiate Drizzle directly in feature code.
- **Relations are in `packages/db/src/relations.ts`** — keep all `relations()` calls there.
