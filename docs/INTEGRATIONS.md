# Integrations Framework Documentation

## Overview

The Portal integrations framework provides a unified, extensible system for managing external service integrations (XMPP, IRC, Discord, MediaWiki, SSH pubnix, Mailcow, etc.). It centralizes account management, API routes, database schema, and UI components into a single, reusable architecture.

## Architecture

### Core Components

The integrations framework lives under `src/features/integrations/lib/`. Core modules:

- **Types** (`src/features/integrations/lib/core/types.ts`): TypeScript interfaces and types
- **Registry** (`src/features/integrations/lib/core/registry.ts`): Central registry for managing integrations
- **Factory** (`src/features/integrations/lib/core/factory.ts`): Utility for accessing integrations by id
- **Constants** (`src/features/integrations/lib/core/constants.ts`): Shared constants and labels
- **User Deletion** (`src/features/integrations/lib/core/user-deletion.ts`): Cleanup logic when users are deleted

### Integration Structure

Each integration lives in its own directory under `src/features/integrations/lib/{integration-id}/`:

```text
src/features/integrations/lib/
├── core/              # Types, registry, factory, constants, user-deletion
├── irc/               # IRC integration (Atheme NickServ)
│   ├── atheme/        # Atheme JSON-RPC client (provisioning)
│   ├── keys.ts        # Environment variable validation (t3-env)
│   ├── config.ts      # Configuration and isIrcConfigured()
│   ├── types.ts       # IrcAccount, CreateIrcAccountRequest, AthemeFault
│   ├── utils.ts       # Nick validation, generateIrcPassword()
│   ├── implementation.ts  # IrcIntegration and registration
│   └── index.ts       # Public exports
├── xmpp/              # XMPP integration implementation
│   ├── keys.ts        # Environment variable validation (t3-env)
│   ├── config.ts      # Configuration and validation
│   ├── types.ts       # Integration-specific types
│   ├── client.ts      # External service client (Prosody REST API)
│   ├── utils.ts       # Utility functions
│   ├── implementation.ts  # Integration instance and registration
│   └── index.ts       # Public exports
└── index.ts           # registerIntegrations() and public API
```

## Database Schema

Portal uses two patterns for storing integration accounts: a unified table for generic integrations, and per-integration tables for integrations that need strongly-typed, queryable columns. IRC and XMPP use per-integration tables.

### Integration Accounts Table

The unified `integration_accounts` table stores integrations that share the same schema and only differ by type:

```typescript
// src/shared/db/schema/integrations/base.ts (or @/db/schema/integrations/base)

export const integrationAccountStatusEnum = pgEnum(
  "integration_account_status",
  ["active", "suspended", "deleted"]
);

export const integrationAccount = pgTable(
  "integration_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    integrationType: text("integration_type").notNull(),
    status: integrationAccountStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    index("integration_accounts_userId_idx").on(table.userId),
    index("integration_accounts_type_idx").on(table.integrationType),
    uniqueIndex("integration_accounts_userId_type_idx").on(
      table.userId,
      table.integrationType
    ),
  ]
);
```

**Key Features:**

- Polymorphic table supporting all integration types
- One account per user per integration type (unique constraint)
- Cascade deletion when users are deleted
- JSON metadata field for integration-specific data
- Status enum: `active`, `suspended`, `deleted`

### Integration-Specific Tables

Some integrations use dedicated tables **instead of** the unified `integration_accounts` table. These per-integration tables duplicate the common field pattern and add strongly-typed columns. There is no foreign key between `integration_accounts` and `irc_account` or `xmpp_account`—they are mutually exclusive storage patterns.

**Tables:**

- **`integration_accounts`**: Shared polymorphic table. Use for integrations that need only generic attributes. Fields: `id`, `user_id`, `integration_type`, `status`, `created_at`, `updated_at`, `metadata`.
- **`irc_account`**: Per-integration table for IRC. References `user` via `user_id`. Fields: `id`, `user_id`, `nick`, `server`, `port`, `status`, `created_at`, `updated_at`, `metadata`.
- **`xmpp_account`**: Per-integration table for XMPP. References `user` via `user_id`. Fields: `id`, `user_id`, `jid`, `username`, `status`, `created_at`, `updated_at`, `metadata`.

**Field placement:**

| Location               | Fields                                                                 |
| ---------------------- | ---------------------------------------------------------------------- |
| Common (all tables)    | `id`, `user_id`, `status`, `created_at`, `updated_at`                  |
| `integration_accounts` | `integration_type` (discriminator)                                     |
| `irc_account`          | `nick` (unique), `server`, `port`                                      |
| `xmpp_account`         | `jid` (unique), `username` (unique)                                    |
| All                    | `metadata` (JSONB for miscellaneous integration-specific data)         |

**Why both exist:** The unified `integration_accounts` table works when integrations share the same schema and only differ by `integration_type`. Per-integration tables (`irc_account`, `xmpp_account`) are used when an integration needs strongly-typed, queryable columns (e.g., unique `nick`, indexed `server`/`port`) and efficient queries without JSON extraction. The `metadata` JSONB column in both patterns holds miscellaneous data that does not need indexing or strict typing.

## Type System

### Core Types

```typescript
// Integration identifier (string)
type IntegrationId = string;

// Account status
type IntegrationStatus = "active" | "suspended" | "deleted";

// Integration account interface
interface IntegrationAccount<TMetadata = Record<string, unknown>> {
  id: string;
  userId: string;
  integrationId: IntegrationId;
  status: IntegrationStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: TMetadata;
}

// Public integration info (exposed via API)
interface IntegrationPublicInfo {
  id: IntegrationId;
  name: string;
  description: string;
  enabled: boolean;
}

// Input types for create/update operations
type IntegrationCreateInput = Record<string, unknown>;
type IntegrationUpdateInput = Record<string, unknown>;
```

### Integration Interface

All integrations must implement the `Integration` interface:

```typescript
interface Integration<
  TAccount extends IntegrationAccount = IntegrationAccount,
  TCreateInput extends IntegrationCreateInput = IntegrationCreateInput,
  TUpdateInput extends IntegrationUpdateInput = IntegrationUpdateInput,
> {
  id: IntegrationId;
  name: string;
  description: string;
  enabled: boolean;

  // Required methods
  createAccount: (userId: string, input: TCreateInput) => Promise<TAccount>;
  getAccount: (userId: string) => Promise<TAccount | null>;
  updateAccount: (accountId: string, input: TUpdateInput) => Promise<TAccount>;
  deleteAccount: (accountId: string) => Promise<void>;

  // Schema methods (for API validation)
  getCreateSchema?: () => z.ZodType<TCreateInput>;
  getUpdateSchema?: () => z.ZodType<TUpdateInput>;

  // Optional methods
  getAccountById?: (accountId: string) => Promise<TAccount | null>;
  validateIdentifier?: (identifier: string) => boolean;
  generateIdentifier?: (email: string) => string;
  customOperations?: Record<string, IntegrationCustomOperation>;
}
```

### Type Definition Pattern
Always infer types from Zod schemas to ensure a single source of truth:

```typescript
import { z } from "zod";
import { CreateIrcAccountRequestSchema } from "@/shared/schemas/integrations/irc";

export type CreateIrcAccountRequest = z.infer<typeof CreateIrcAccountRequestSchema>;
```

## API Routes

### Base Routes

All integration API routes follow a consistent pattern:

#### List Integrations

```text
GET /api/integrations
```

Returns all available integrations (public info only).

**Response:**

```json
{
  "ok": true,
  "integrations": [
    {
      "id": "xmpp",
      "name": "XMPP",
      "description": "XMPP chat accounts and provisioning",
      "enabled": true
    }
  ]
}
```

#### Get Current User's Account

```text
GET /api/integrations/{integrationId}/accounts
```

Returns the current authenticated user's account for the specified integration.

**Response:**

```json
{
  "ok": true,
  "account": {
    "id": "account-id",
    "userId": "user-id",
    "integrationId": "xmpp",
    "status": "active",
    "createdAt": "2026-01-16T00:00:00Z",
    "updatedAt": "2026-01-16T00:00:00Z",
    "metadata": {}
  }
}
```

**Errors:**

- `404`: Account not found
- `403`: Integration disabled
- `404`: Unknown integration

#### Create Account

```text
POST /api/integrations/{integrationId}/accounts
```

Creates a new integration account for the current user.

**Request Body:**

```json
{
  "username": "optional-username"
}
```

**Response:**

```json
{
  "ok": true,
  "account": { /* account object */ }
}
```

**Status Code:** `201 Created`

**Errors:**

- `400`: Invalid request body (Zod validation)
- `403`: Integration disabled
- `404`: Unknown integration
- `409`: Account already exists

#### Get Account by ID

```text
GET /api/integrations/{integrationId}/accounts/{id}
```

Gets a specific account by ID (admin or owner only).

**Response:**

```json
{
  "ok": true,
  "account": { /* account object */ }
}
```

**Errors:**

- `400`: Integration does not support account lookup
- `403`: Forbidden (not owner or admin)
- `404`: Account not found

#### Update Account

```text
PATCH /api/integrations/{integrationId}/accounts/{id}
```

Updates an integration account (admin or owner only).

**Request Body:**

```json
{
  "status": "suspended",
  "metadata": { "custom": "data" }
}
```

**Response:**

```json
{
  "ok": true,
  "account": { /* updated account object */ }
}
```

**Errors:**

- `400`: Integration does not support updates
- `400`: Invalid request body
- `403`: Forbidden (not owner or admin)
- `404`: Account not found

#### Delete Account

```text
DELETE /api/integrations/{integrationId}/accounts/{id}
```

Deletes an integration account and cleans up external services (admin or owner only).

**Response:**

```json
{
  "ok": true,
  "message": "Integration account deleted successfully"
}
```

**Errors:**

- `400`: Integration does not support deletion
- `403`: Forbidden (not owner or admin)
- `404`: Account not found

### Route Implementation

All routes are implemented in:

- `src/app/api/integrations/route.ts` - List integrations
- `src/app/api/integrations/[integration]/accounts/route.ts` - GET/POST accounts
- `src/app/api/integrations/[integration]/accounts/[id]/route.ts` - GET/PATCH/DELETE specific account

**Key Features:**

- Authentication required for all routes (`requireAuth`)
- Admin or owner authorization for account-specific operations
- Capability checks before calling integration methods
- Zod validation for request bodies
- Consistent error handling via `handleAPIError`
- Sentry instrumentation for performance tracking

## Client-Side API

### API Functions

Located in `src/lib/api/integrations.ts`:

```typescript
// Fetch available integrations
fetchIntegrations(): Promise<IntegrationPublicInfo[]>

// Fetch current user's account
fetchIntegrationAccount<TAccount>(integrationId: string): Promise<TAccount | null>

// Fetch account by ID
fetchIntegrationAccountById<TAccount>(integrationId: string, id: string): Promise<TAccount>

// Create account
createIntegrationAccount<TAccount>(
  integrationId: string,
  input: Record<string, unknown>
): Promise<TAccount>

// Update account
updateIntegrationAccount<TAccount>(
  integrationId: string,
  id: string,
  input: Record<string, unknown>
): Promise<TAccount>

// Delete account
deleteIntegrationAccount(integrationId: string, id: string): Promise<void>
```

**Note:** All integrations use these generic API functions. There are no integration-specific API client files. Simply pass the `integrationId` (e.g., `"xmpp"`) to use any integration.

### React Query Hooks

Located in `src/hooks/use-integration.ts`:

```typescript
// Fetch available integrations
useIntegrations(): UseQueryResult<IntegrationPublicInfo[]>

// Fetch current user's account
useIntegrationAccount<TAccount>(integrationId: string): UseQueryResult<TAccount | null>

// Fetch account by ID
useIntegrationAccountById<TAccount>(
  integrationId: string,
  id: string
): UseQueryResult<TAccount>

// Create account mutation
useCreateIntegrationAccount<TAccount>(integrationId: string): UseMutationResult

// Update account mutation
useUpdateIntegrationAccount<TAccount>(integrationId: string): UseMutationResult

// Delete account mutation
useDeleteIntegrationAccount(integrationId: string): UseMutationResult
```

**Features:**

- Automatic cache invalidation on mutations
- Type-safe with generics
- Optimistic updates where applicable
- Configurable stale times

**Note:** All integrations use these generic hooks. There are no integration-specific hooks (e.g., `useXmppAccount`). Use `useIntegrationAccount("xmpp")` instead.

## UI Components

### IntegrationManagement

Located in `src/components/integrations/integration-management.tsx`.

A generic, reusable component for managing integration accounts.

**Props:**

```typescript
interface IntegrationManagementProps<TAccount extends { id: string }> {
  integrationId: string;
  title: string;
  description: string;
  createLabel: string;
  createInputLabel?: string;
  createInputPlaceholder?: string;
  createInputHelp?: string;
  createInputToPayload?: (value: string) => Record<string, unknown>;
  renderAccountDetails?: (account: TAccount) => ReactNode;
}
```

**Features:**

- Handles loading and error states
- Create account form (with optional input field)
- Display account details (customizable via `renderAccountDetails`)
- Delete account with confirmation dialog
- Status badge display
- Toast notifications for success/error

**Usage Example:**

```tsx
<IntegrationManagement<XmppAccount>
  integrationId="xmpp"
  title="XMPP"
  description="XMPP chat accounts"
  createLabel="Create XMPP Account"
  createInputLabel="Username (optional)"
  createInputPlaceholder="Leave empty to use your email username"
  createInputToPayload={(value) =>
    value.trim() ? { username: value.trim() } : {}
  }
  renderAccountDetails={(account) => (
    <div>
      <Label>JID: {account.jid}</Label>
    </div>
  )}
/>
```

### IntegrationCard

Located in `src/components/integrations/integration-card.tsx`.

A simple card component for displaying integration information.

**Props:**

```typescript
interface IntegrationCardProps {
  integration: IntegrationPublicInfo;
}
```

## Creating a New Integration

### Step 1: Create Integration Directory

Create a new directory under `src/features/integrations/lib/{integration-id}/`:

```bash
mkdir -p src/features/integrations/lib/{integration-id}
```

### Step 2: Define Types

Create `types.ts`:

```typescript
import type { IntegrationAccount } from "@/features/integrations/lib/core/types";

export interface {Integration}Account extends IntegrationAccount {
  integrationId: "{integration-id}";
  // Add integration-specific fields
}

export interface Create{Integration}AccountRequest
  extends Record<string, unknown> {
  // Define create input fields
}

export interface Update{Integration}AccountRequest
  extends Record<string, unknown> {
  // Define update input fields
}
```

### Step 3: Define Environment Variables

Create `keys.ts`:

```typescript
import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const keys = () =>
  createEnv({
    server: {
      {INTEGRATION}_API_URL: z.url().optional(),
      {INTEGRATION}_API_KEY: z.string().optional(),
    },
    runtimeEnv: {
      {INTEGRATION}_API_URL: process.env.{INTEGRATION}_API_URL,
      {INTEGRATION}_API_KEY: process.env.{INTEGRATION}_API_KEY,
    },
  });
```

### Step 4: Create Configuration

Create `config.ts`:

```typescript
import "server-only";
import { keys } from "./keys";

const env = keys();

export const {integration}Config = {
  apiUrl: env.{INTEGRATION}_API_URL,
  apiKey: env.{INTEGRATION}_API_KEY,
} as const;

export function is{Integration}Configured(): boolean {
  return !!(env.{INTEGRATION}_API_URL && env.{INTEGRATION}_API_KEY);
}
```

### Step 5: Implement Integration Class

Create `implementation.ts`:

```typescript
import "server-only";
import { IntegrationBase } from "@/features/integrations/lib/core/base";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";
import { db } from "@/db";
import { integrationAccount } from "@/db/schema/integrations/base";
import type {
  {Integration}Account,
  Create{Integration}AccountRequest,
  Update{Integration}AccountRequest,
} from "./types";
import { is{Integration}Configured } from "./config";

export class {Integration}Integration extends IntegrationBase<
  {Integration}Account,
  Create{Integration}AccountRequest,
  Update{Integration}AccountRequest
> {
  constructor() {
    super({
      id: "{integration-id}",
      name: "{Integration Name}",
      description: "{Integration description}",
      enabled: is{Integration}Configured(),
    });
  }

  async createAccount(
    userId: string,
    input: Create{Integration}AccountRequest
  ): Promise<{Integration}Account> {
    // Implementation
  }

  async getAccount(userId: string): Promise<{Integration}Account | null> {
    // Implementation
  }

  async updateAccount(
    accountId: string,
    input: Update{Integration}AccountRequest
  ): Promise<{Integration}Account> {
    // Implementation
  }

  async deleteAccount(accountId: string): Promise<void> {
    // Implementation
  }
}

export const {integration}Integration = new {Integration}Integration();

export function register{Integration}Integration(): void {
  getIntegrationRegistry().register({integration}Integration);
}
```

### Step 6: Create Index File

Create `index.ts`:

```typescript
// biome-ignore lint/performance/noBarrelFile: Public API for integration
export { {integration}Integration, register{Integration}Integration } from "./implementation";
export type {
  {Integration}Account,
  Create{Integration}AccountRequest,
  Update{Integration}AccountRequest,
} from "./types";
export { {integration}Config, is{Integration}Configured } from "./config";
```

### Step 7: Register Integration

Ensure your integration’s `register{Integration}Integration()` is called from the app’s registration path. The app calls `registerIntegrations()` from `src/features/integrations/lib/index.ts` (or wherever the registry is used); add your integration’s registration there so it runs before API routes use the registry.

### Step 8: Add to Environment

Add your integration’s env keys to the app. Either extend the main `src/env.ts` with your integration’s `keys()` (from `@/features/integrations/lib/{integration-id}/keys`), or ensure the module that needs them imports and uses that `keys()` function. The project uses `@t3-oss/env-nextjs` and per-module `keys()`; see existing integrations (e.g. XMPP) for the pattern.

### Step 9: Create UI Integration

Add integration to the integrations page (`src/app/(dashboard)/app/integrations/integrations-content.tsx`):

```tsx
{integrations.map((integration) => {
  if (integration.id === "{integration-id}") {
    return (
      <IntegrationManagement<{Integration}Account>
        // ... props
      />
    );
  }
  // ...
})}
```

## User Deletion Cleanup

When a user is deleted, all their integration accounts are automatically cleaned up via the `cleanupIntegrationAccounts` function in `src/lib/integrations/core/user-deletion.ts`.

This function:

1. Iterates through all registered integrations
2. Calls each integration's `deleteAccount` method
3. Runs cleanup in parallel using `Promise.allSettled`
4. Captures any errors to Sentry without blocking the deletion process

The cleanup is triggered from:

- Better Auth `beforeDelete` hook (`src/lib/auth/config.ts`)
- Admin user deletion route (`src/app/api/admin/users/[id]/route.ts`)

## Query Keys

Integration query keys are defined in `src/lib/api/query-keys.ts`:

```typescript
integrations: {
  list: () => ["integrations", "list"] as const,
  accounts: {
    all: (integrationId: string) =>
      ["integrations", integrationId, "accounts"] as const,
    current: (integrationId: string) =>
      ["integrations", integrationId, "accounts", "current"] as const,
    details: (integrationId: string) =>
      ["integrations", integrationId, "accounts", "detail"] as const,
    detail: (integrationId: string, id: string) =>
      ["integrations", integrationId, "accounts", "detail", id] as const,
  },
}
```

**Usage Examples:**

- List all integrations: `queryKeys.integrations.list()`
- Current XMPP account: `queryKeys.integrations.accounts.current("xmpp")`
- Specific account: `queryKeys.integrations.accounts.detail("xmpp", accountId)`

All integrations use the same query key structure - there are no integration-specific query keys.

## Environment Variable Management

Each integration manages its own environment variables using the `t3-env` pattern:

1. **Module-level `keys.ts`**: Defines and validates environment variables using Zod schemas
2. **Central `env.ts`**: Extends all module keys for unified validation
3. **Usage**: Modules import and use their own `keys()` function, not direct `process.env` access

**Benefits:**

- Type-safe environment variables
- Runtime validation
- Early error detection
- Modular organization

## Best Practices

### Lazy Configuration Validation

Integrations should use lazy validation to prevent blocking the entire application if they're not configured:

```typescript
// ✅ Good: Lazy validation
export function validate{Integration}Config(): void {
  if (!config.apiKey) {
    throw new Error("Configuration required");
  }
}

// ❌ Bad: Validation at module load time
validate{Integration}Config(); // Blocks app startup
```

### Error Handling

- Use Sentry for error tracking (`captureException`)
- Use Sentry spans for performance tracking (`startSpan`)
- Provide user-friendly error messages
- Handle external service failures gracefully

### Type Safety

- Use TypeScript generics for type-safe account handling
- Extend base types rather than redefining them
- Use `Record<string, unknown>` for flexible input types

### Database Queries

- Always include `integrationId` when querying accounts
- Use the unified `integration_accounts` table
- Leverage unique constraints for one-account-per-user enforcement

### API Design

- Follow RESTful conventions
- Use consistent response formats
- Validate all inputs with Zod
- Check capabilities before calling integration methods
- Return appropriate HTTP status codes

## Examples

### XMPP Integration

The XMPP integration serves as the reference implementation:

- **Location**: `src/lib/integrations/xmpp/`
- **External Service**: Prosody XMPP server (REST API)
- **Features**:
  - Username generation from email
  - Username validation
  - Prosody account provisioning
  - Account deletion with cleanup

See the XMPP implementation files for a complete example of how to build an integration.

### IRC Integration

The IRC integration provisions NickServ accounts on atl.chat via Atheme JSON-RPC (Flow B):

- **Location**: `src/features/integrations/lib/irc/`
- **External Service**: Atheme JSON-RPC (NickServ REGISTER). UnrealIRCd JSON-RPC is optional for admin use (who's online).
- **Database**: Dedicated `irc_account` table. No password stored. See [Integration-Specific Tables](#integration-specific-tables) for schema details and the relationship to the unified `integration_accounts` table.
- **Features**:
  - Nick required on create (user must enter; no auto-generate in v1).
  - One-time password generated and shown once; user saves it for `/msg NickServ IDENTIFY`.
  - **⚠️ Delete is soft-delete only** (NickServ account remains registered on Atheme). This means:
    - Portal marks the record as `status='deleted'` but retains the database row
    - The nick remains registered on Atheme's NickServ
    - Re-registration with the same nick fails at the Portal level (nick uniqueness check finds the deleted record) and would fail at Atheme (fault code 8 "already exists") if attempted
    - Manual Atheme cleanup (NickServ DROP) is required to fully remove the registration and free the nick
  - Connect instructions: server:port (TLS), same for all users from env (`IRC_SERVER`, `IRC_PORT`).
- **Environment**:
  - **Required for provisioning**: `IRC_ATHEME_JSONRPC_URL`
  - **Required for user connections**: `IRC_SERVER`, `IRC_PORT`
  - **Optional security**: `IRC_ATHEME_INSECURE_SKIP_VERIFY`
  - **Optional admin features**: `IRC_UNREAL_JSONRPC_URL`, `IRC_UNREAL_RPC_USER`, `IRC_UNREAL_RPC_PASSWORD`, `IRC_UNREAL_INSECURE_SKIP_VERIFY`
- **Auth**: Optional `irc` scope and `irc_nick` claim in `customUserInfoClaims` when user has an IRC account.
- **Unreal (admin)**: When Unreal env is set, use `isUnrealConfigured()` and `unrealRpcClient` from `@/features/integrations/lib/irc`: `userList()`, `userGet(nick)`, `channelList()`, `channelGet(channel)`. HTTPS POST to `/api` with Basic Auth (rpc-user). Use for admin “IRC online” or channel list views.

**Prerequisite:** atl.chat must enable Atheme `misc/httpd` and `transport/jsonrpc` (e.g. port 8081) before Portal can provision.

## Current State

All integrations, including XMPP and IRC, use the unified integrations framework. There are no integration-specific API routes, hooks, or components - everything goes through the generic integration APIs and components.

**All integrations use:**

- Generic API routes: `/api/integrations/{integrationId}/accounts/*`
- Generic hooks: `useIntegrationAccount()`, `useCreateIntegrationAccount()`, etc.
- Generic components: `IntegrationManagement<TAccount>`
- Unified query keys: `queryKeys.integrations.accounts.*`
