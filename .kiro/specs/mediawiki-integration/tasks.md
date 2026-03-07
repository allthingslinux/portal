# Implementation Plan: MediaWiki Integration

## Overview

Add full MediaWiki integration to the ATL Portal following the existing IRC/XMPP patterns. This includes a database schema, authenticated bot client, integration implementation, API routes, user-facing UI, admin management, and wiki stats display. The existing read-only `MediaWikiClient` is preserved; a new `MediaWikiBotClient` handles authenticated write operations.

## Tasks

- [x] 1. Database schema and validation schemas
  - [x] 1.1 Create the `mediawiki_account` Drizzle schema
    - Create `packages/db/src/schema/mediawiki.ts` with `pgEnum` for status (`active`, `suspended`, `deleted`) and `pgTable` for `mediawiki_account`
    - Columns: `id`, `userId`, `wikiUsername`, `wikiUserId`, `status`, `createdAt`, `updatedAt`, `metadata`
    - Add unique filtered indexes on `userId` and `wikiUsername` for non-deleted records
    - Add cascade delete on `userId` FK to `user.id`
    - Export `createSelectSchema` and `createInsertSchema` Zod schemas
    - Export from `packages/db/src/schema/index.ts`
    - Add relations in `packages/db/src/relations.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Create MediaWiki Zod validation schemas
    - Create `packages/schemas/src/integrations/mediawiki.ts`
    - Define `MediaWikiAccountStatusSchema`, `WikiUsernameSchema` (1–85 chars, alphanumeric + spaces/hyphens/underscores), `CreateMediaWikiAccountRequestSchema`, `UpdateMediaWikiAccountRequestSchema`, `MediaWikiAccountSchema`
    - Export from `packages/schemas/src/integrations/` index
    - _Requirements: 1.5, 3.7, 7.3, 12.6_

  - [ ]* 1.3 Write property test for wiki username validation
    - **Property 6: Wiki username validation**
    - Generate random strings with `fast-check`, verify the validator accepts exactly alphanumeric + spaces/hyphens/underscores in 1–85 char range and rejects everything else
    - Test file: `apps/portal/tests/features/integrations/mediawiki/username-validation.property.test.ts`
    - **Validates: Requirements 3.7**

  - [ ]* 1.4 Write property test for uniqueness constraints
    - **Property 1: Uniqueness constraints for non-deleted accounts**
    - Generate random account data, verify duplicate `wikiUsername` or `userId` insertions are rejected for non-deleted records
    - Test file: `apps/portal/tests/features/integrations/mediawiki/uniqueness.property.test.ts`
    - **Validates: Requirements 1.2, 1.3**

- [x] 2. Environment configuration and bot client
  - [x] 2.1 Extend environment configuration with bot credentials
    - Update `apps/portal/src/features/integrations/lib/mediawiki/keys.ts` to add `WIKI_BOT_USERNAME` and `WIKI_BOT_PASSWORD` as optional server env vars
    - Add `isMediaWikiConfigured()` helper that returns `true` when all three vars are set
    - Update `apps/portal/src/env.ts` if needed to include the new keys
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 2.2 Implement the `MediaWikiBotClient`
    - Create `apps/portal/src/features/integrations/lib/mediawiki/bot-client.ts`
    - Implement `login()` with two-step MediaWiki login (fetch login token, POST `action=login`)
    - Implement session cookie management via `Map<string, string>` parsed from `set-cookie` headers
    - Implement `getToken(type)` for `csrf`, `createaccount`, `login` tokens
    - Implement `createAccount(username, password)` using `action=createaccount`
    - Implement `resetPassword(username)` using `action=resetpassword`
    - Implement `blockUser(username, reason, options)` using `action=block`
    - Implement `unblockUser(username, reason)` using `action=unblock`
    - Implement `getUserInfo(username)` via `list=users` with `usprop=editcount|registration|groups|blockinfo`
    - Implement `getUserContribs(username, limit)` via `list=usercontribs`
    - Implement `ensureAuthenticated()` with lazy login and single-retry on token rejection
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2_

  - [x] 2.3 Add TypeScript types for MediaWiki API responses
    - Create `apps/portal/src/features/integrations/lib/mediawiki/types.ts`
    - Define `UserInfo`, `UserContrib`, and raw API response interfaces
    - _Requirements: 8.1, 8.2_

  - [ ]* 2.4 Write unit tests for bot client login and token management
    - Mock MediaWiki API responses for login success, login failure, token fetch, session expiry + retry
    - Test file: `apps/portal/tests/features/integrations/mediawiki/bot-client.test.ts`
    - _Requirements: 2.1, 2.2, 2.5, 2.6_

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Integration implementation and registry
  - [x] 4.1 Implement `MediaWikiIntegration` class
    - Create `apps/portal/src/features/integrations/lib/mediawiki/implementation.ts`
    - Extend `IntegrationBase` with `createAccount`, `getAccount`, `getAccountById`, `updateAccount`, `deleteAccount`, `resetPassword`
    - `createAccount`: validate input, check duplicates, generate temp password, insert pending record, call bot client, update to active or clean up on failure
    - `deleteAccount`: attempt block (non-fatal on failure), soft-delete local record
    - `resetPassword`: verify ownership, call bot client
    - `updateAccount`: handle status changes, trigger block/unblock for suspend/reactivate
    - _Requirements: 3.1–3.7, 4.1–4.3, 5.1–5.5, 6.1–6.4, 7.2_

  - [x] 4.2 Register MediaWiki integration in the registry
    - Update `apps/portal/src/features/integrations/lib/mediawiki/index.ts` to export `registerMediaWikiIntegration()`
    - Register with id `mediawiki`, name `MediaWiki`, description referencing atl.wiki
    - Provide Zod schemas for create/update input
    - Set `enabled` based on `isMediaWikiConfigured()`
    - Add call to `registerMediaWikiIntegration()` in `apps/portal/src/features/integrations/lib/index.ts`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 4.3 Write property test for successful creation round-trip
    - **Property 4: Successful account creation persists active record with temporary password**
    - Generate random valid usernames, mock successful API response, verify DB record is `active` and `temporaryPassword` is returned
    - Test file: `apps/portal/tests/features/integrations/mediawiki/creation-roundtrip.property.test.ts`
    - **Validates: Requirements 3.3, 3.4**

  - [ ]* 4.4 Write property test for failed creation cleanup
    - **Property 5: Failed creation leaves no database record**
    - Generate random valid usernames, mock failed API response, verify no DB record persists
    - Test file: `apps/portal/tests/features/integrations/mediawiki/creation-cleanup.property.test.ts`
    - **Validates: Requirements 3.6**

  - [ ]* 4.5 Write property test for account retrieval round-trip
    - **Property 7: Account retrieval round-trip**
    - Generate random account data, insert into DB, verify `getAccount` and `getAccountById` return matching data
    - Test file: `apps/portal/tests/features/integrations/mediawiki/retrieval-roundtrip.property.test.ts`
    - **Validates: Requirements 4.1, 4.3**

  - [ ]* 4.6 Write property test for deletion resilience
    - **Property 9: Deletion resilience — soft-delete regardless of external block result**
    - Generate random accounts, mock block success/failure randomly, verify local record is always soft-deleted
    - Test file: `apps/portal/tests/features/integrations/mediawiki/deletion-resilience.property.test.ts`
    - **Validates: Requirements 6.1, 6.3**

  - [ ]* 4.7 Write property test for configuration determines enabled status
    - **Property 10: Configuration determines enabled status**
    - Generate random combinations of env var values, verify `enabled` is `true` iff all three vars are non-empty
    - Test file: `apps/portal/tests/features/integrations/mediawiki/config-enabled.property.test.ts`
    - **Validates: Requirements 7.4, 7.5, 13.1, 13.4**

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Admin API routes
  - [x] 6.1 Create admin MediaWiki accounts list endpoint
    - Create `apps/portal/src/app/api/admin/mediawiki-accounts/route.ts` with GET handler
    - Paginated list with status filter, auth + admin permission checks
    - Validate query params with Zod
    - _Requirements: 11.1, 11.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 6.2 Create admin MediaWiki account management endpoint
    - Create `apps/portal/src/app/api/admin/mediawiki-accounts/[id]/route.ts` with PATCH handler
    - Handle suspend (→ block on MediaWiki) and reactivate (→ unblock on MediaWiki) status changes
    - Auth + admin permission checks, Zod validation
    - _Requirements: 11.3, 11.4, 11.5, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 6.3 Write property test for admin status filter
    - **Property 11: Admin status filter returns only matching accounts**
    - Generate random sets of accounts with mixed statuses, apply filter, verify all returned records match
    - Test file: `apps/portal/tests/app/api/admin/mediawiki-accounts/status-filter.property.test.ts`
    - **Validates: Requirements 11.2**

  - [ ]* 6.4 Write property test for invalid request bodies rejected
    - **Property 15: Invalid request bodies are rejected**
    - Generate random invalid payloads (missing fields, wrong types, out-of-range values), verify all are rejected by Zod schemas
    - Test file: `apps/portal/tests/app/api/admin/mediawiki-accounts/invalid-bodies.property.test.ts`
    - **Validates: Requirements 12.6**

  - [ ]* 6.5 Write unit tests for admin API auth and permissions
    - Test 401 for unauthenticated requests, 403 for non-admin users
    - Test file: `apps/portal/tests/app/api/admin/mediawiki-accounts/route.test.ts`
    - _Requirements: 12.4, 12.5_

- [x] 7. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. User-facing UI components
  - [x] 8.1 Create MediaWiki integration management config
    - Add MediaWiki-specific configuration for the `IntegrationManagement` component
    - Setup dialog collecting `wikiUsername` via the standard single-input pattern
    - Temporary password confirmation dialog with copy-to-clipboard on successful creation
    - Account card showing wiki username, status, creation date
    - Password reset action with info about email being sent
    - Disconnect action triggering account deletion
    - Wire into the integrations page alongside IRC, XMPP, Mailcow
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 8.2 Create Wiki User Stats Card component
    - Create `apps/portal/src/features/integrations/components/wiki-user-stats.tsx`
    - Fetch user info (edit count, registration date) and recent contributions via a TanStack Query hook
    - Display total edit count, registration date, most recent edit timestamp
    - Skeleton loading state while data loads
    - Error fallback "Failed to load" state when API is unreachable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 8.3 Create Wiki Site Stats display
    - Ensure the existing `fetchWikiStats()` / site stats component displays total articles, total edits, active users
    - Add fallback dash (`—`) with "Failed to load" when API unreachable
    - Add "Not configured" message when `WIKI_API_URL` is not set
    - Skeleton loading placeholder
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 9. Admin UI for MediaWiki accounts
  - [x] 9.1 Create admin MediaWiki accounts panel
    - Add MediaWiki accounts table to the admin panel following the IRC admin pattern
    - Display username, status, linked Portal user, timestamps
    - Status filter dropdown
    - Suspend/reactivate actions calling the admin PATCH endpoint
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 10. Database migration and wiring
  - [x] 10.1 Generate and verify database migration
    - Run `pnpm db:generate` to create migration file for the `mediawiki_account` table
    - Verify migration includes the enum, table, indexes, and FK constraint
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 10.2 Wire integration into user deletion handler
    - Update `apps/portal/src/features/integrations/lib/core/user-deletion.ts` to include MediaWiki in the user deletion flow (if not handled by cascade)
    - _Requirements: 1.4_

- [x] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The generic integration route handlers at `/api/integrations/[integration]/accounts` already handle CRUD — the MediaWiki integration just needs to be registered in the registry
- The existing read-only `MediaWikiClient` is preserved unchanged; only the new `MediaWikiBotClient` and `MediaWikiIntegration` are added
