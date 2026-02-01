# Zod Schema Standards

This document outlines the standards, patterns, and best practices for using Zod schemas in the Portal application.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Three-Layer System](#three-layer-system)
- [Directory Structure](#directory-structure)
- [When to Use What](#when-to-use-what)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Migration Guide](#migration-guide)

## Overview

The Portal uses a **Database First** approach where:

1. **Database schemas** (Drizzle) are the single source of truth
2. **Zod schemas** are generated from database schemas or created for API validation
3. **TypeScript types** are inferred from Zod schemas

This ensures type safety at both compile-time and runtime while maintaining a single source of truth.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Schema (Drizzle)                │
│                    Source of Truth                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              drizzle-zod (Generate Base Schemas)            │
│              createSelectSchema(), createInsertSchema()     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Custom Zod Schemas (API Validation)               │
│           Extend/refine base schemas when needed            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              TypeScript Types (z.infer)                     │
│              Compile-time type safety                       │
└─────────────────────────────────────────────────────────────┘
```

## Three-Layer System

### 1. Database Schema Layer (Drizzle)

**Location**: `src/shared/db/schema/`

**Purpose**: Define the structure of your data

**Example**:
```typescript
// src/shared/db/schema/irc.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const ircAccount = pgTable("irc_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  nick: text("nick").notNull(),
  status: ircAccountStatusEnum("status").default("pending").notNull(),
  metadata: jsonb("metadata"),
  // ... other fields
});

// Generate Zod schemas from Drizzle table
export const selectIrcAccountSchema = createSelectSchema(ircAccount);
export const insertIrcAccountSchema = createInsertSchema(ircAccount);
```

### 2. Zod Schema Layer (Runtime Validation)

**Location**: `src/shared/schemas/`

**Purpose**: Validate data at API boundaries and add custom validation rules

**Example**:
```typescript
// src/shared/schemas/integrations/irc.ts
import { selectIrcAccountSchema } from "@/db/schema/irc";

// Extend base schema with custom validation
export const CreateIrcAccountRequestSchema = z.object({
  nick: z
    .string()
    .trim()
    .min(1, "Nick is required")
    .max(IRC_NICK_MAX_LENGTH)
    .refine(isValidIrcNick, "Invalid nick format"),
});

// Transform for proper typing
export const IrcAccountSchema = selectIrcAccountSchema
  .extend({
    integrationId: z.literal("irc"),
  })
  .transform((data) => ({
    ...data,
    metadata: data.metadata as Record<string, unknown> | undefined,
  }));
```

### 3. TypeScript Type Layer (Compile-time Safety)

**Location**: Type files (e.g., `src/features/integrations/lib/irc/types.ts`)

**Purpose**: Provide compile-time type checking

**Example**:
```typescript
// src/features/integrations/lib/irc/types.ts
import type { z } from "zod";
import type { IrcAccountSchema } from "@/shared/schemas/integrations/irc";

// Infer type from Zod schema
export type IrcAccount = z.infer<typeof IrcAccountSchema>;
```

## Directory Structure

```
src/
├── shared/
│   ├── db/schema/              # Database schemas (PRIMARY)
│   │   ├── irc.ts              # Table + drizzle-zod schemas
│   │   ├── xmpp.ts             # Table + drizzle-zod schemas
│   │   └── auth.ts
│   │
│   └── schemas/                # Custom validation (SECONDARY)
│       ├── index.ts            # Central exports
│       ├── utils.ts            # Reusable schema utilities
│       └── integrations/
│           ├── irc.ts          # IRC API-specific validation
│           ├── xmpp.ts         # XMPP API-specific validation
│           └── index.ts
│
└── features/
    └── integrations/
        └── lib/
            └── irc/
                └── types.ts    # TypeScript types (z.infer)
```

## When to Use What

### Use Drizzle Schema When:

- ✅ Defining database table structure
- ✅ Creating migrations
- ✅ Querying the database

### Use drizzle-zod Generated Schemas When:

- ✅ Validating data that matches database structure exactly
- ✅ Basic CRUD operations
- ✅ You need a starting point for custom validation

### Use Custom Zod Schemas When:

- ✅ API validation differs from database structure
- ✅ Partial updates (only some fields)
- ✅ Complex validation rules (regex, custom logic)
- ✅ Nested object validation
- ✅ Transformations needed

### Use TypeScript Types When:

- ✅ Function parameters and return types
- ✅ Component props
- ✅ Internal application logic
- ❌ **Never** define types manually - always use `z.infer`

## Best Practices

### 1. Single Source of Truth

**❌ Don't**: Define the same structure in multiple places
```typescript
// Bad: Manual interface duplicates database schema
export interface IrcAccount {
  id: string;
  userId: string;
  nick: string;
  // ... duplicated from database
}
```

**✅ Do**: Infer types from schemas
```typescript
// Good: Type inferred from Zod schema
export type IrcAccount = z.infer<typeof IrcAccountSchema>;
```

### 2. Use drizzle-zod for Base Schemas

**❌ Don't**: Manually recreate database schemas in Zod
```typescript
// Bad: Duplicating database structure
const IrcAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  nick: z.string(),
  // ... manually duplicated
});
```

**✅ Do**: Generate from database schema
```typescript
// Good: Generated from Drizzle table
export const selectIrcAccountSchema = createSelectSchema(ircAccount);
```

### 3. Extend, Don't Duplicate

**❌ Don't**: Create entirely new schemas for variations
```typescript
// Bad: Duplicating fields
const UpdateIrcAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  nick: z.string().optional(),
  status: z.enum(["active", "suspended"]).optional(),
});
```

**✅ Do**: Use `.pick()`, `.omit()`, `.partial()`, `.extend()`
```typescript
// Good: Extending base schema
const UpdateIrcAccountSchema = selectIrcAccountSchema
  .pick({ nick: true, status: true, metadata: true })
  .partial();
```

### 4. Centralize Reusable Utilities

**Location**: `src/shared/schemas/utils.ts`

```typescript
// Reusable schema utilities
export const metadataSchema = z.record(z.string(), z.unknown()).optional();
export const uuidSchema = z.string().uuid();
export const nonEmptyStringSchema = z.string().min(1);
```

### 5. Document Custom Validation

```typescript
/**
 * Schema for creating an IRC account via API
 * Validates nick format and length
 */
export const CreateIrcAccountRequestSchema = z.object({
  nick: z
    .string()
    .trim()
    .min(1, "Nick is required")
    .max(IRC_NICK_MAX_LENGTH, `Nick too long (max ${IRC_NICK_MAX_LENGTH})`)
    .refine(
      isValidIrcNick,
      "Invalid nick. Use letters, digits, or [ ] \\ ^ _ ` { | } ~ -"
    ),
});
```

### 6. Handle JSONB Fields Properly

drizzle-zod generates `unknown` for JSONB fields. Use `.transform()` to properly type them:

```typescript
export const IrcAccountSchema = selectIrcAccountSchema
  .extend({
    integrationId: z.literal("irc"),
  })
  .transform((data) => ({
    ...data,
    // Transform metadata from unknown to proper type
    metadata: data.metadata as Record<string, unknown> | undefined,
  }));
```

## Examples

### Example 1: Basic CRUD Schemas

```typescript
// src/shared/db/schema/user.ts
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Generate base schemas
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user);

// src/shared/schemas/user.ts
import { insertUserSchema, selectUserSchema } from "@/db/schema/user";

// Create: Use insert schema with custom validation
export const CreateUserRequestSchema = insertUserSchema
  .omit({ id: true, createdAt: true })
  .extend({
    email: z.string().email("Invalid email format"),
    name: z.string().min(1, "Name is required"),
  });

// Update: Partial fields
export const UpdateUserRequestSchema = selectUserSchema
  .pick({ name: true, email: true })
  .partial();

// Response: Full user object
export const UserSchema = selectUserSchema;

// Types
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
```

### Example 2: Complex Validation

```typescript
// src/shared/schemas/integrations/irc.ts
export const CreateIrcAccountRequestSchema = z.object({
  nick: z
    .string()
    .trim()
    .min(1, "Nick is required")
    .max(IRC_NICK_MAX_LENGTH)
    .refine(
      (nick) => /^[a-zA-Z0-9\[\]\\^_`{|}~-]+$/.test(nick),
      "Invalid IRC nick format"
    )
    .refine(
      async (nick) => {
        const existing = await checkNickAvailability(nick);
        return !existing;
      },
      "Nick already taken"
    ),
});
```

### Example 3: Nested Objects

```typescript
export const IntegrationConfigSchema = z.object({
  irc: z.object({
    server: z.string().url(),
    port: z.number().int().min(1).max(65535),
    ssl: z.boolean().default(true),
  }).optional(),
  xmpp: z.object({
    domain: z.string(),
    adminJid: z.string().email(),
  }).optional(),
});
```

## Migration Guide

### Migrating Existing Code

#### Step 1: Add drizzle-zod to Database Schema

```typescript
// Before
export const myTable = pgTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// After
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const myTable = pgTable("my_table", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

export const selectMyTableSchema = createSelectSchema(myTable);
export const insertMyTableSchema = createInsertSchema(myTable);
```

#### Step 2: Create Custom Validation Schemas

```typescript
// src/shared/schemas/my-feature.ts
import { selectMyTableSchema } from "@/db/schema/my-table";

export const CreateMyEntityRequestSchema = insertMyTableSchema
  .omit({ id: true })
  .extend({
    name: z.string().min(1, "Name is required"),
  });

export const UpdateMyEntityRequestSchema = selectMyTableSchema
  .pick({ name: true })
  .partial();
```

#### Step 3: Update Type Definitions

```typescript
// Before
export interface MyEntity {
  id: string;
  name: string;
}

// After
import type { z } from "zod";
import type { selectMyTableSchema } from "@/db/schema/my-table";

export type MyEntity = z.infer<typeof selectMyTableSchema>;
```

#### Step 4: Update Implementation

```typescript
// Before
const data = req.body;
if (!data.name) {
  throw new Error("Name is required");
}

// After
const parsed = CreateMyEntityRequestSchema.safeParse(req.body);
if (!parsed.success) {
  throw new Error(parsed.error.issues[0]?.message ?? "Validation failed");
}
const data = parsed.data;
```

## Related Documentation

- [API Documentation](./API.md) - API route patterns and validation
- [Architecture](./ARCHITECTURE.md) - Overall application architecture
- [Integrations](./INTEGRATIONS.md) - Integration system documentation
- [TypeScript Config](./TSCONFIG.md) - TypeScript configuration

## References

- [Zod Documentation](https://zod.dev/)
- [drizzle-zod](https://orm.drizzle.team/docs/zod)
- [Drizzle ORM](https://orm.drizzle.team/)
