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
│       ├── user.ts             # User/Admin validation schemas
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

## Trust Boundaries & Philosophy

We follow the "Total TypeScript" philosophy on when to use Zod based on trust levels:

### 1. Untrusted Inputs (⚠️ MUST USE ZOD)
Any data entering the system from outside must be treated as hostile and validated immediately.
*   **API Requests**: Bodies, Headers, Query Parameters.
*   **CLI Arguments**: `process.argv`
*   **Webhooks**: Payloads from external services.

### 2. "Sort-of" Trusted Inputs (✅ SHOULD USE ZOD)
Data sources we generally trust but don't control, where drift or bugs could cause issues.
*   **Response Validation**: We validate our own API responses to prevent accidental data leaks (security).
*   **Third-party APIs**: Validate upstream responses to fail fast if their contract changes.

### 3. Trusted & Controlled Inputs (🚫 SKIP ZOD)
Data where we control both the producer and consumer, and they are deployed together.
*   **Internal Function Calls**: Use TypeScript types.
*   **Frontend Data Fetching**: If the frontend and backend are in the same repo/deployment and types are shared, client-side validation of API responses is optional (unless version drift is a major concern). Validating *user input* (forms) on the client is still recommended for UX.


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

drizzle-zod generates `unknown` for JSONB fields. Use `.transform()` and `metadataSchema.parse()` to properly type and validate them:

```typescript
import { metadataSchema } from "@/shared/schemas/utils";

export const IrcAccountSchema = selectIrcAccountSchema
  .transform((data) => ({
    ...data,
    // Validate and type the JSONB metadata field
    metadata: data.metadata 
      ? metadataSchema.parse(data.metadata) 
      : undefined,
  }));
```

### 7. Use Branded Types for Domain Primitives

Use `brandedString` helper to create distinct types for strings that shouldn't be mixed (e.g., UserId vs. Nick):

```typescript
import { brandedString } from "@/shared/schemas/utils";

// Define branded schema
export const IrcNickSchema = brandedString<"IrcNick">(
  z.string().min(1).max(30)
);

// Inferred type is unique
export type IrcNick = z.infer<typeof IrcNickSchema>;

// Valid:
const nick: IrcNick = IrcNickSchema.parse("foo");

// Error: Type 'string' is not assignable to type 'IrcNick'
const bad: IrcNick = "just a string";
```

### 8. Type-Safe Integration Hooks

When using integration hooks, let Zod schemas drive the input types:

```typescript
// Define schema
export const CreateAccountSchema = z.object({ username: z.string() });
export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

// Use with hook
const mutation = useCreateIntegrationAccount<Account, CreateAccountInput>(
  "my-integration"
);

// Type-safe at call site
mutation.mutate({ username: "alice" });
```
### 9. API Response Validation
Every API endpoint must validate its response to ensure no internal data (like passwords or PII) leaks and to guarantee the API contract.

```typescript
// Define schema for the response
export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});
// Infer type
export type UserResponse = z.infer<typeof UserResponseSchema>;

// Internal type (has more fields)
type InternalUser = UserResponse & { passwordHash: string; internalFlag: boolean };

export async function GET() {
  const internalUser: InternalUser = await db.getUser();

  // ❌ BAD: Leaks passwordHash and internalFlag
  // return Response.json(internalUser);

  // ✅ GOOD: Strips unknown keys, validating the output
  const safeUser = UserResponseSchema.parse(internalUser);
  return Response.json(safeUser);
}
```

### 10. Structured Error Handling
We use a structured `APIError` that aligns with Zod's `flatten()` output to provide detailed validation feedback.

```typescript
if (!parsed.success) {
  const error = parsed.error;
  throw new APIError("Validation failed", 400, {
    issues: error.issues,
    flattened: error.flatten(),
  });
}
```

### 11. Human-Readable Validation Errors
We use `zod-validation-error` to transform raw Zod issues into user-friendly strings that can be returned in API responses.

```typescript
// src/shared/api/utils.ts
import { fromError } from "zod-validation-error";

export function handleAPIError(error: unknown) {
  if (isZodError(error)) {
    const validationError = fromError(error);
    return Response.json({
      ok: false,
      error: validationError.message, // "Validation error: Name is required at 'name'"
      details: error.format()
    }, { status: 400 });
  }
}
```

### 12. Client-Side Form Validation
Standardize on `react-hook-form` with the `@hookform/resolvers/zod` for all dashboard forms.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema } from "@/shared/schemas/user";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(CreateUserSchema),
});
```

---

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

> [!IMPORTANT]
> Schemas with **async refinements** (like the `checkNickAvailability` check above) must be parsed using `.parseAsync()` or `.safeParseAsync()`. Standard synchronous `.parse()` will throw a runtime error when encountering a Promise.

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
- [Total TypeScript: When should you use Zod?](https://www.totaltypescript.com/when-should-you-use-zod)
