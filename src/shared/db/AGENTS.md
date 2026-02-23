# src/shared/db

> Scope: Drizzle ORM schema definitions, database client, relations, and query helpers.

## What Lives Here

| File | Purpose |
|------|---------|
| `client.ts` | Drizzle database client — the `db` instance |
| `config.ts` | Database connection config (pooling, logging) |
| `keys.ts` | DB env vars (`DATABASE_URL`) via t3-env |
| `relations.ts` | Drizzle relations definitions (cross-table relationships) |
| `index.ts` | Barrel export — `import { db } from "@/db"` |
| `schema/` | Individual schema files per domain |

## Schema Files (`schema/`)

| File | Tables |
|------|--------|
| `auth.ts` | `user`, `session`, `account`, `verification` (BetterAuth-generated) |
| `api-keys.ts` | `apiKey` |
| `integrations/` | `integrationAccount` (IRC, XMPP, Discord records) |
| `irc.ts` | IRC-specific tables |
| `xmpp.ts` | XMPP-specific tables |
| `oauth.ts` | OAuth provider tables |

## Usage

```typescript
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"

// Query
const result = await db.select().from(user).where(eq(user.id, userId))

// Insert
await db.insert(user).values({ ... })

// Transaction
await db.transaction(async (tx) => {
  await tx.insert(user).values({ ... })
  await tx.insert(integrationAccount).values({ ... })
})
```

## Migration Workflow

```bash
# 1. Edit schema files in schema/
# 2. Generate migration
pnpm db:generate

# 3. Review generated SQL in drizzle/
# 4. Apply migration
pnpm db:migrate

# Dev shortcut (NEVER in production)
pnpm db:push

# Wipe DB (dev only): drops public schema so migrations run clean
pnpm db:wipe
```

## Critical Rules

- **Never use `db:push` in production** — always generate and run migrations.
- **Never use raw SQL** unless Drizzle cannot express the query — if you must, document why.
- **Auth tables (`schema/auth.ts`) are BetterAuth-owned** — don't modify columns BetterAuth manages. Add custom columns only in a separate migration, never by re-running `pnpm auth:init-schema`.
- **Always use transactions** for operations that modify multiple tables atomically.
- **Import `db` from `@/db`** — never instantiate Drizzle directly in feature code.
- **Relations are in `relations.ts`** — keep all `relations()` calls there, not scattered in schema files.
