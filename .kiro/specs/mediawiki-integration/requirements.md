# Requirements Document

## Introduction

MediaWiki integration for the ATL Portal, enabling users to create and manage wiki accounts on atl.wiki directly from the portal. This integration follows the existing integration framework (IRC, XMPP, Mailcow) and adds wiki-specific features: account provisioning via the MediaWiki API, basic account management (password reset, account status), and user contribution statistics displayed in the portal dashboard.

A read-only MediaWiki API client already exists (`mediawiki/client.ts`) supporting recent changes, site stats, and page info via unauthenticated GET requests. This feature adds a new authenticated bot client that maintains session cookies for write operations (account creation, blocking, password reset) and extends the integration with the full implementation (database schema, API routes, UI components, stats display).

## Glossary

- **Portal**: The centralized ATL identity and hub management web application (Next.js App Router)
- **MediaWiki_API**: The MediaWiki Action API at `atl.wiki/api.php`, used for both read-only queries and authenticated bot actions
- **Wiki_Account**: A user account on the atl.wiki MediaWiki instance, linked to a Portal user
- **Integration_Registry**: The Portal's integration framework that manages integration lifecycle (create, read, update, delete accounts)
- **MediaWiki_Integration**: The integration implementation class extending `IntegrationBase`, registered in the Integration_Registry
- **Bot_Account**: A MediaWiki account created via Special:BotPasswords with `createaccount`, `block`, and `resetpassword` rights granted, used by the Portal to perform privileged API operations on behalf of users
- **Bot_Client**: An authenticated MediaWiki API client that logs in via `action=login` using Bot_Account credentials, maintains session cookies across requests, and performs write operations requiring CSRF or createaccount tokens
- **Read_Only_Client**: The existing unauthenticated MediaWiki API client (`mediawiki/client.ts`) that performs GET-only queries (recent changes, site stats, page info) without session management
- **CSRF_Token**: A cross-site request forgery token obtained via `action=query&meta=tokens&type=csrf`, required by the MediaWiki_API for write operations such as block, unblock, and resetpassword
- **Createaccount_Token**: A token obtained via `action=query&meta=tokens&type=createaccount`, required by the MediaWiki_API specifically for the `action=createaccount` operation
- **User_Contributions**: Edit history and statistics for a specific MediaWiki user, retrieved via the MediaWiki_API `list=usercontribs` endpoint
- **User_Info**: User metadata (edit count, registration date, groups, block status) retrieved via the MediaWiki_API `list=users` endpoint with `usprop` parameters
- **Wiki_Stats_Card**: A dashboard UI component displaying a user's wiki contribution statistics
- **Admin_Panel**: The Portal's admin dashboard where administrators manage user accounts across integrations

## Requirements

### Requirement 1: MediaWiki Account Database Schema

**User Story:** As a developer, I want a database schema for MediaWiki accounts, so that wiki account state is persisted and queryable like other integrations.

#### Acceptance Criteria

1. THE MediaWiki_Integration SHALL store Wiki_Account records in a `mediawiki_account` PostgreSQL table with columns: `id`, `user_id`, `wiki_username`, `wiki_user_id`, `status`, `created_at`, `updated_at`, and `metadata`
2. THE MediaWiki_Integration SHALL enforce a unique constraint on `wiki_username` for non-deleted accounts
3. THE MediaWiki_Integration SHALL enforce a unique constraint on `user_id` for non-deleted accounts, limiting each Portal user to one active Wiki_Account
4. THE MediaWiki_Integration SHALL cascade-delete Wiki_Account records when the associated Portal user is deleted
5. THE MediaWiki_Integration SHALL generate Zod select and insert schemas from the Drizzle table definition

### Requirement 2: Authenticated Bot Client

**User Story:** As a developer, I want an authenticated MediaWiki bot client, so that the Portal can perform privileged write operations (account creation, blocking, password reset) against the MediaWiki_API.

#### Acceptance Criteria

1. WHEN the Bot_Client initializes, THE Bot_Client SHALL authenticate with the MediaWiki_API by fetching a login token via `action=query&meta=tokens&type=login` and then posting credentials via `action=login` with `lgname`, `lgpassword`, and `lgtoken`
2. THE Bot_Client SHALL maintain session cookies across all subsequent requests after successful login
3. WHEN a write operation requires a CSRF_Token, THE Bot_Client SHALL fetch the token via `action=query&meta=tokens&type=csrf` using the authenticated session
4. WHEN a write operation requires a Createaccount_Token, THE Bot_Client SHALL fetch the token via `action=query&meta=tokens&type=createaccount` using the authenticated session
5. IF the Bot_Account login fails, THEN THE Bot_Client SHALL return a descriptive error and prevent further write operations
6. IF a session expires or a token is rejected, THEN THE Bot_Client SHALL re-authenticate and retry the operation once before returning an error
7. THE Bot_Client SHALL coexist with the Read_Only_Client, which continues to handle unauthenticated GET queries (site stats, recent changes, page info)

### Requirement 3: MediaWiki Account Provisioning

**User Story:** As a portal user, I want to create a wiki account from the portal, so that I can access atl.wiki with my ATL identity.

#### Acceptance Criteria

1. WHEN a user requests wiki account creation, THE Bot_Client SHALL fetch a Createaccount_Token via `action=query&meta=tokens&type=createaccount`
2. WHEN a user requests wiki account creation, THE Bot_Client SHALL POST to `action=createaccount` with the user's chosen wiki username, a generated temporary password (in both `password` and `retype` fields), a `createreturnurl`, and the Createaccount_Token
3. WHEN the MediaWiki_API responds with `{"createaccount":{"status":"PASS"}}`, THE MediaWiki_Integration SHALL persist a Wiki_Account record with status `active` in the database
4. WHEN account creation succeeds, THE MediaWiki_Integration SHALL return the generated temporary password to the user
5. IF the chosen wiki username is already taken on MediaWiki, THEN THE MediaWiki_Integration SHALL return a descriptive error indicating the username is unavailable
6. IF the MediaWiki_API account creation fails, THEN THE MediaWiki_Integration SHALL return a descriptive error without persisting a database record
7. THE MediaWiki_Integration SHALL validate that the wiki username contains only alphanumeric characters, spaces, hyphens, and underscores, and is between 1 and 85 characters

### Requirement 4: MediaWiki Account Retrieval

**User Story:** As a portal user, I want to view my wiki account details in the portal, so that I can see my account status and linked username.

#### Acceptance Criteria

1. WHEN a user requests their wiki account, THE MediaWiki_Integration SHALL return the Wiki_Account record from the database including `wiki_username`, `wiki_user_id`, `status`, and timestamps
2. WHEN a user has no Wiki_Account, THE MediaWiki_Integration SHALL return null
3. WHEN an account ID is provided, THE MediaWiki_Integration SHALL retrieve the specific Wiki_Account by its primary key

### Requirement 5: MediaWiki Password Reset

**User Story:** As a portal user, I want to trigger a wiki password reset through the portal, so that I can regain access to my wiki account without contacting an admin.

#### Acceptance Criteria

1. WHEN a user requests a password reset for their Wiki_Account, THE Bot_Client SHALL fetch a CSRF_Token and POST to `action=resetpassword` with the `user` parameter set to the Wiki_Account's wiki_username
2. WHEN the password reset request succeeds, THE MediaWiki_Integration SHALL inform the user that a password reset email has been sent to the email address configured on the wiki account
3. IF the wiki account has no email address configured, THEN THE MediaWiki_Integration SHALL return a descriptive error instructing the user to configure an email on the wiki first
4. IF the MediaWiki_API password reset fails, THEN THE MediaWiki_Integration SHALL return a descriptive error
5. THE MediaWiki_Integration SHALL verify that the requesting user owns the Wiki_Account before performing the password reset

### Requirement 6: MediaWiki Account Deletion and Blocking

**User Story:** As a portal user, I want to disconnect my wiki account from the portal, so that I can manage my integration status.

#### Acceptance Criteria

1. WHEN a user requests deletion of their Wiki_Account, THE MediaWiki_Integration SHALL update the Wiki_Account status to `deleted` in the database
2. WHEN a user requests deletion of their Wiki_Account, THE Bot_Client SHALL fetch a CSRF_Token and POST to `action=block` with the `user`, `reason`, `nocreate`, and `autoblock` parameters to block the corresponding MediaWiki account
3. IF the MediaWiki_API block operation fails, THEN THE MediaWiki_Integration SHALL still mark the local Wiki_Account as `deleted` and log the failure
4. THE MediaWiki_Integration SHALL verify that the requesting user owns the Wiki_Account before performing deletion

### Requirement 7: Integration Registry Registration

**User Story:** As a developer, I want the MediaWiki integration registered in the integration framework, so that it is discoverable and manageable like IRC and XMPP.

#### Acceptance Criteria

1. THE MediaWiki_Integration SHALL register itself in the Integration_Registry with id `mediawiki`, name `MediaWiki`, and a description referencing atl.wiki
2. THE MediaWiki_Integration SHALL extend the `IntegrationBase` class and implement `createAccount`, `getAccount`, `updateAccount`, and `deleteAccount`
3. THE MediaWiki_Integration SHALL provide Zod schemas for account creation input and account update input
4. WHEN the `WIKI_API_URL`, `WIKI_BOT_USERNAME`, and `WIKI_BOT_PASSWORD` environment variables are configured, THE MediaWiki_Integration SHALL report as enabled
5. WHEN any required environment variable is missing, THE MediaWiki_Integration SHALL report as disabled

### Requirement 8: User Contribution Statistics

**User Story:** As a portal user, I want to see my wiki contribution stats in the portal dashboard, so that I can track my wiki activity.

#### Acceptance Criteria

1. WHEN a user's wiki account is active, THE MediaWiki_Integration SHALL fetch the user's total edit count and registration date from the MediaWiki_API via `list=users` with `usprop=editcount|registration`
2. WHEN a user's wiki account is active, THE MediaWiki_Integration SHALL fetch the user's recent edits (up to 10) from the MediaWiki_API via `list=usercontribs` with `ucuser`, `uclimit`, and `ucprop=title|timestamp|comment|sizediff`
3. THE Wiki_Stats_Card SHALL display the user's total edit count, registration date, and most recent edit timestamp
4. IF the MediaWiki_API is unreachable, THEN THE Wiki_Stats_Card SHALL display a fallback "Failed to load" state
5. WHILE the wiki statistics are loading, THE Wiki_Stats_Card SHALL display a skeleton loading placeholder

### Requirement 9: Wiki Site Statistics Dashboard Component

**User Story:** As a portal user, I want to see overall wiki health stats on the dashboard, so that I can understand community wiki activity.

#### Acceptance Criteria

1. THE Wiki_Stats_Card SHALL display the total number of wiki articles, total edits, and active users from the MediaWiki_API site statistics endpoint
2. WHEN the MediaWiki_API is unreachable, THE Wiki_Stats_Card SHALL display a dash (`—`) with a "Failed to load" message
3. WHILE site statistics are loading, THE Wiki_Stats_Card SHALL display a skeleton loading placeholder
4. WHEN the `WIKI_API_URL` environment variable is not configured, THE Wiki_Stats_Card SHALL display a dash (`—`) with a "Not configured" message

### Requirement 10: Integration Management UI

**User Story:** As a portal user, I want to manage my wiki account through the same integration UI pattern as IRC and XMPP, so that the experience is consistent.

#### Acceptance Criteria

1. THE MediaWiki_Integration SHALL provide a setup dialog that collects a wiki username from the user
2. WHEN account creation succeeds, THE MediaWiki_Integration SHALL display the temporary password in a confirmation dialog with a copy-to-clipboard action
3. THE MediaWiki_Integration SHALL display the connected Wiki_Account with its username, status, and creation date in the integration card
4. THE MediaWiki_Integration SHALL provide a password reset action in the account management card that informs the user a reset email will be sent to the email configured on the wiki account
5. THE MediaWiki_Integration SHALL provide a disconnect action in the account management card that triggers account deletion
6. THE MediaWiki_Integration SHALL use the existing `IntegrationManagement` component pattern with integration-specific configuration

### Requirement 11: Admin Management of Wiki Accounts

**User Story:** As an admin, I want to view and manage wiki accounts in the admin panel, so that I can support users and enforce policies.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a list of all Wiki_Account records with username, status, linked Portal user, and timestamps
2. THE Admin_Panel SHALL allow administrators to filter Wiki_Account records by status
3. THE Admin_Panel SHALL allow administrators to suspend or reactivate a Wiki_Account by updating its status
4. WHEN an administrator suspends a Wiki_Account, THE Bot_Client SHALL fetch a CSRF_Token and POST to `action=block` with the `user`, `reason`, `expiry`, and `autoblock` parameters to block the corresponding MediaWiki account
5. WHEN an administrator reactivates a Wiki_Account, THE Bot_Client SHALL fetch a CSRF_Token and POST to `action=unblock` with the `user` and `reason` parameters to unblock the corresponding MediaWiki account

### Requirement 12: API Routes

**User Story:** As a developer, I want REST API routes for the MediaWiki integration, so that the frontend can interact with wiki accounts through the standard integration API pattern.

#### Acceptance Criteria

1. THE Portal SHALL expose wiki account CRUD operations through the existing `/api/integrations/[integration]/accounts` route pattern
2. THE Portal SHALL expose a password reset endpoint at `/api/integrations/mediawiki/accounts/[id]/reset-password` accepting POST requests
3. THE Portal SHALL expose admin wiki account management endpoints at `/api/admin/mediawiki-accounts` and `/api/admin/mediawiki-accounts/[id]`
4. WHEN an unauthenticated request is received, THE Portal SHALL return a 401 status code
5. WHEN a non-admin user requests admin endpoints, THE Portal SHALL return a 403 status code
6. THE Portal SHALL validate all request bodies using Zod schemas before processing

### Requirement 13: Environment Configuration

**User Story:** As a developer, I want MediaWiki integration environment variables validated at startup, so that misconfiguration is caught early.

#### Acceptance Criteria

1. THE MediaWiki_Integration SHALL require `WIKI_API_URL`, `WIKI_BOT_USERNAME`, and `WIKI_BOT_PASSWORD` environment variables for bot operations
2. THE MediaWiki_Integration SHALL validate environment variables using `@t3-oss/env-nextjs` with Zod schemas
3. WHEN `WIKI_API_URL` is not set, THE MediaWiki_Integration SHALL fall back to `https://atl.wiki/api.php`
4. WHEN `WIKI_BOT_USERNAME` or `WIKI_BOT_PASSWORD` is not set, THE MediaWiki_Integration SHALL disable bot operations and report the integration as disabled
5. THE MediaWiki_Integration SHALL add `WIKI_BOT_USERNAME` and `WIKI_BOT_PASSWORD` to the existing `keys.ts` environment configuration alongside `WIKI_API_URL`
