---
name: Migrate from Supabase Client to Drizzle + NextAuth
overview: Remove all Supabase client usage and migrate to Drizzle for database operations and NextAuth.js for authentication. This involves replacing auth flows, session management, storage, and updating all components/hooks that depend on Supabase client.
todos:
  - id: setup-nextauth
    content: Install NextAuth.js and create configuration with providers (email/password, OAuth, OTP)
    status: completed
  - id: create-auth-api
    content: Create NextAuth API route handler at src/app/api/auth/[...nextauth]/route.ts
    status: completed
    dependencies:
      - setup-nextauth
  - id: update-session-utils
    content: Create NextAuth session utilities and update require-user.ts to use NextAuth session
    status: completed
    dependencies:
      - setup-nextauth
  - id: update-drizzle-client
    content: Remove Supabase client dependency from drizzle-client.ts and use NextAuth session for RLS context
    status: completed
    dependencies:
      - update-session-utils
  - id: replace-auth-hooks
    content: Replace all Supabase auth hooks with NextAuth equivalents (signIn, signOut, useSession, etc.)
    status: pending
    dependencies:
      - create-auth-api
  - id: update-auth-components
    content: Update all auth components to use NextAuth hooks instead of Supabase client
    status: completed
    dependencies:
      - replace-auth-hooks
  - id: migrate-otp-service
    content: Update OTP service to use Drizzle instead of Supabase client RPC calls
    status: completed
    dependencies:
      - update-drizzle-client
  - id: migrate-storage
    content: Update file upload system to use Storage REST API or alternative storage solution
    status: completed
  - id: update-webhooks
    content: Update database webhook handlers to use Drizzle admin client instead of Supabase client
    status: completed
    dependencies:
      - update-drizzle-client
  - id: remove-supabase-clients
    content: Delete all Supabase client files (browser-client, server-client, server-admin-client, middleware-client)
    status: completed
    dependencies:
      - replace-auth-hooks
      - update-drizzle-client
      - migrate-otp-service
      - migrate-storage
      - update-webhooks
  - id: update-route-handlers
    content: Update route and action enhancers to use NextAuth session instead of Supabase client
    status: completed
    dependencies:
      - update-session-utils
  - id: cleanup-dependencies
    content: Remove Supabase client packages from package.json and add NextAuth dependencies
    status: completed
    dependencies:
      - remove-supabase-clients
---

# Migration Plan: Remove Supabase Client → Drizzle + NextAuth.js

## Overview

This migration removes all Supabase client dependencies and replaces them with:

- **NextAuth.js** for authentication
- **Drizzle ORM** for all database operations
- **Direct PostgreSQL connection** (keeping Supabase as database provider, but no client SDK)

## Phase 1: Setup NextAuth.js Infrastructure

### 1.1 Install and Configure NextAuth.js

- Install `next-auth` package
- Create `src/core/auth/nextauth/` directory structure
- Create `src/core/auth/nextauth/config.ts` with NextAuth configuration
- Set up providers (email/password, OAuth, OTP)
- Configure session strategy (JWT or database)
- Set up callbacks for session/user handling

### 1.2 Create Auth API Routes

- Create `src/app/api/auth/[...nextauth]/route.ts` for NextAuth API handler
- Migrate auth callback logic from `src/app/auth/callback/route.ts`
- Update middleware to use NextAuth session

### 1.3 Session Management

- Replace `getSupabaseServerClient().auth.getSession()` with `getServerSession()`
- Update `require-user.ts` to use NextAuth session instead of Supabase client
- Update `check-requires-mfa.ts` to work with NextAuth session
- Create new session utilities in `src/core/auth/nextauth/session.ts`

## Phase 2: Update Drizzle Client

### 2.1 Remove Supabase Client Dependency from Drizzle

- Update `src/core/database/supabase/clients/drizzle-client.ts`:
- Remove `getSupabaseServerClient()` import and usage
- Update `getDrizzleSupabaseClient()` to get JWT from NextAuth session instead
- Update RLS context setup to use NextAuth session token
- Keep admin client as-is (no auth needed)

### 2.2 Update RLS Context

- Modify JWT claims setup to work with NextAuth JWT structure
- Ensure `request.jwt.claims` and `request.jwt.claim.sub` are set correctly
- Update role setting logic

## Phase 3: Replace Auth Hooks and Components

### 3.1 Client-Side Auth Hooks

Replace all hooks in `src/core/database/supabase/hooks/`:

- `use-sign-in-with-email-password.ts` → Use NextAuth `signIn()`
- `use-sign-up-with-email-password.ts` → Use NextAuth or custom signup API
- `use-sign-in-with-otp.ts` → Use NextAuth or custom OTP API
- `use-sign-in-with-provider.ts` → Use NextAuth OAuth providers
- `use-sign-out.ts` → Use NextAuth `signOut()`
- `use-auth-change-listener.ts` → Use NextAuth session listener
- `use-user.ts` → Use `useSession()` from NextAuth
- `use-supabase.ts` → Remove (no longer needed)

### 3.2 Auth Components

Update components that use Supabase client:

- `src/shared/components/auth-provider.tsx` → Use NextAuth `SessionProvider`
- `src/features/auth/components/*` → Update to use NextAuth hooks
- Remove Supabase client props from components

### 3.3 Server Actions and Routes

- Update `src/shared/next/routes/index.ts` to use NextAuth session
- Update `src/shared/next/actions/index.ts` to use NextAuth session
- Update all server actions that use `requireUser()` to work with NextAuth

## Phase 4: Migrate RPC Functions

### 4.1 OTP Service

- Update `src/core/auth/otp/server/otp.service.ts`:
- Remove Supabase client dependency
- Replace `client.rpc()` calls with Drizzle queries or direct SQL
- Use `getDrizzleSupabaseAdminClient()` for admin operations

### 4.2 Other RPC Calls

- Search for all `.rpc()` calls in codebase
- Replace with Drizzle queries or direct SQL using `sql` template
- Update `src/core/database/supabase/queries/*.ts` as needed

## Phase 5: Storage Migration

### 5.1 File Upload System

- Update `src/shared/components/hooks/use-supabase-upload.tsx`:
- Option A: Use Supabase Storage REST API directly (no client)
- Option B: Migrate to alternative storage (S3, Cloudflare R2, etc.)
- Option C: Use NextAuth file upload handling

### 5.2 Update File Upload Components

- `src/shared/components/makerkit/file-uploader.tsx` → Remove Supabase client prop
- `src/features/accounts/components/personal-account-settings/update-account-image-container.tsx`
- `src/features/team-accounts/components/settings/update-team-account-image-container.tsx`

## Phase 6: Remove Supabase Client Files

### 6.1 Delete Client Files

- `src/core/database/supabase/clients/browser-client.ts`
- `src/core/database/supabase/clients/server-client.ts`
- `src/core/database/supabase/clients/server-admin-client.ts`
- `src/core/database/supabase/clients/middleware-client.ts`
- `src/core/database/supabase/get-supabase-client-keys.ts` (or repurpose for storage only)
- `src/core/database/supabase/get-secret-key.ts` (if no longer needed)

### 6.2 Update Auth Callback Service

- `src/core/database/supabase/auth-callback.service.ts` → Migrate to NextAuth callbacks or remove

## Phase 7: Update Database Webhooks

### 7.1 Webhook Handler

- Update `src/core/database-webhooks/server/services/database-webhook-handler.service.ts`:
- Remove `getSupabaseServerAdminClient()` usage
- Use `getDrizzleSupabaseAdminClient()` instead

### 7.2 Webhook Router

- Update `src/core/database-webhooks/server/services/database-webhook-router.service.ts`:
- Remove Supabase client dependency
- Use Drizzle admin client

## Phase 8: Clean Up Dependencies

### 8.1 Package.json

- Remove `@supabase/ssr` and `@supabase/supabase-js` (or keep only if needed for storage API)
- Add `next-auth` and related packages
- Update any other auth-related dependencies

### 8.2 Environment Variables

- Remove `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLIC_KEY` (unless keeping for storage)
- Add NextAuth environment variables (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, etc.)
- Keep `DATABASE_URL` or `SUPABASE_DATABASE_URL` for Drizzle

## Phase 9: Update Type Definitions

### 9.1 Remove Supabase Types

- Remove or update `src/core/database/supabase/database.types.ts` (if generated from Supabase)
- Remove `src/core/database/supabase/types.ts` if Supabase-specific
- Update `JWTUserData` type to match NextAuth session structure

### 9.2 Update Import Paths

- Search and replace all imports from Supabase client files
- Update type imports throughout codebase

## Phase 10: Testing and Validation

### 10.1 Auth Flows

- Test sign in/up flows
- Test OAuth providers
- Test OTP/MFA flows
- Test session persistence
- Test sign out

### 10.2 Database Operations

- Verify all Drizzle queries work correctly
- Test RLS policies with NextAuth sessions
- Test admin operations

### 10.3 Storage

- Test file uploads
- Test file retrieval
- Verify storage permissions

## Key Files to Modify

### Critical Files

- `src/core/database/supabase/clients/drizzle-client.ts` - Remove Supabase client dependency
- `src/core/database/supabase/require-user.ts` - Use NextAuth session
- `src/shared/next/routes/index.ts` - Update auth check
- `src/shared/next/actions/index.ts` - Update auth check
- All files in `src/core/database/supabase/hooks/` - Replace with NextAuth hooks

### Components

- `src/shared/components/auth-provider.tsx`
- All auth components in `src/features/auth/components/`
- All account/team components that use Supabase client

### Services

- `src/core/auth/otp/server/otp.service.ts`
- `src/core/database-webhooks/server/services/*.ts`

## Notes

- Keep Supabase PostgreSQL database connection (via Drizzle)
- May need to keep some Supabase environment variables if using Storage REST API
- RLS policies may need adjustment for NextAuth JWT structure
- Consider migration path for existing users/sessions