# Mailcow Integration

The Portal Mailcow integration provisions email mailboxes on the configured Mailcow instance via its REST API. Users create one mailbox per Portal identity; they choose a local part (username) and set a password at creation time. Passwords are never stored in Portal.

## Overview

- **Location**: `src/features/integrations/lib/mailcow/`
- **External Service**: Mailcow REST API (`POST /api/v1/add/mailbox`, etc.)
- **Database**: Dedicated `mailcow_account` table (one account per user).
- **Password Handling**: User sets password on create; passed once to Mailcow. Never stored in Portal.

## Module Structure

```
src/features/integrations/lib/mailcow/
├── client.ts        # Mailcow REST API client (create/update/delete/get mailbox, get domain)
├── keys.ts          # Environment variable validation (t3-env)
├── config.ts        # mailcowConfig, isMailcowConfigured(), validateMailcowConfig()
├── types.ts         # MailcowAccount, CreateMailboxRequest, UpdateMailboxRequest
├── utils.ts         # isValidMailcowLocalPart(), formatEmail()
├── implementation.ts # MailcowIntegration class and registration
└── index.ts         # Public exports
```

## Setup

1. **Run the migration** so the `mailcow_account` table exists: `pnpm db:migrate`
2. Set the environment variables below and restart the app.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MAILCOW_API_URL` | Yes | **Base URL** of your Mailcow UI — the origin only, e.g. `https://mail.atl.tools`. Do **not** include `/api` or `/api/v1`; the client appends these paths automatically. |
| `MAILCOW_API_KEY` | Yes | Read-write API key (from Mailcow: Configuration → Access → Edit administrator details → API). Use the read-write key, not read-only. |
| `MAILCOW_DOMAIN` | Yes | Email domain for provisioning (e.g. `atl.tools`). Must already exist in Mailcow. |
| `NEXT_PUBLIC_MAILCOW_WEB_URL` | No | Webmail UI URL for the "Open webmail" link on the Mail page. When unset, the link is hidden. |
| `MAILCOW_OAUTH_CLIENT_ID` | No | OAuth2 client ID for "Sign in with Mailcow". Create via Mailcow API or UI (see below). |
| `MAILCOW_OAUTH_CLIENT_SECRET` | No | OAuth2 client secret for "Sign in with Mailcow". |
| `NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED` | No | Set to `"true"` to show "Sign in with Mailcow" on the auth page. Requires OAuth credentials above. |

**Example `.env`:**
```
MAILCOW_API_URL=https://mail.atl.tools
MAILCOW_API_KEY=your-read-write-api-key
MAILCOW_DOMAIN=atl.tools
NEXT_PUBLIC_MAILCOW_WEB_URL=https://mail.atl.tools
```

**Troubleshooting:**
- **401 / auth failed**: Check API key is read-write and your Portal server IP is in Mailcow's API allowed IP list (Configuration → Access → Edit administrator details → API).
- **404 / wrong path**: Ensure `MAILCOW_API_URL` is the base URL only. Wrong: `https://mail.atl.tools/api/v1`. Correct: `https://mail.atl.tools`.
- **Domain not found**: Create the domain in Mailcow first (E-Mail → Configuration → Domains).

## Sign in with Mailcow (OAuth)

Users can sign into the Portal using their Mailcow mailbox credentials — similar to "Sign in with Discord". This uses Mailcow's OAuth2 provider endpoints (`/oauth/authorize`, `/oauth/token`, `/oauth/profile`).

### Setup

1. **Create an OAuth2 client in Mailcow:**
   - **Script (recommended):** Run `pnpm create-mailcow-oauth-client` with `MAILCOW_API_URL`, `MAILCOW_API_KEY`, and `BETTER_AUTH_URL` in `.env`. The script creates the client and prints the credentials to add to `.env`.
   - **Manual API:** `POST /api/v1/add/oauth2-client` with `{ "redirect_uri": "https://portal.atl.tools/api/auth/oauth2/callback/mailcow" }` (use your Portal base URL and callback path). Then `GET /api/v1/get/oauth2-client/all` to retrieve `client_id` and `client_secret`.
   - Via Mailcow UI: Configuration → Access → OAuth2 (if available).

2. **Set environment variables:**
   ```
   MAILCOW_OAUTH_CLIENT_ID=<client_id>
   MAILCOW_OAUTH_CLIENT_SECRET=<client_secret>
   NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED=true
   ```

3. Restart the app. The sign-in page will show a "Sign in with Mailcow" button.

The Portal maps Mailcow's `/oauth/profile` response (`username`, `email`, `full_name`/`displayName`) to the user profile. Account linking is supported: users can link a Mailcow account to an existing Portal identity.

## Database Schema

```sql
-- mailcow_account table
CREATE TABLE mailcow_account (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  domain TEXT NOT NULL,
  local_part TEXT NOT NULL,
  status mailcow_account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Enum: active, suspended, deleted
-- Indexes: userId, email, status
-- Unique: (userId) and (email) where status != 'deleted'
```

- **One account per user**: `user_id` is unique (excluding deleted).
- **No password stored**: Password is passed to Mailcow on create only.
- **Soft delete**: Deleting in Portal sets `status = 'deleted'` and calls Mailcow delete API.

## User Flow

1. User opens **Integrations** and selects Mailcow.
2. User enters a local part (email username, e.g. `john.doe`).
3. User enters password and confirmation (min 8 characters).
4. Portal validates the local part (alphanumeric, hyphens, underscores, dots; no `@` or spaces).
5. Portal checks domain exists in Mailcow and email uniqueness in DB and Mailcow.
6. Portal calls Mailcow `POST /api/v1/add/mailbox` with domain, local_part, password, name.
7. On success, Portal inserts a `mailcow_account` row and returns the account.
8. User logs into Mailcow web UI or mail clients with `local_part@domain` and their password.

## API

The Mailcow integration uses the unified integrations API (no Mailcow-specific routes):

- **Create**: `POST /api/integrations/mailcow/accounts` with body `{ "local_part": "john.doe", "password": "...", "password2": "..." }`. Returns `{ account }`.
- **Get**: `GET /api/integrations/mailcow/accounts` (current user) or `GET /api/integrations/mailcow/accounts/[id]` (owner or admin).
- **Update**: `PATCH /api/integrations/mailcow/accounts/[id]` (status, metadata; password reset not in v1).
- **Delete**: `DELETE /api/integrations/mailcow/accounts/[id]` (soft-delete + Mailcow API delete).

## Admin

### User Detail View

Admin user detail sheet (Users tab → user icon) shows Mailcow account (email, domain, status) when present.

### Mailcow Accounts List

Admin dashboard → **Mailcow Accounts** tab lists all Mailcow accounts with user, email, domain, local part, status, and created date. Pagination and optional `status` filter via `GET /api/admin/mailcow-accounts`.

## Mailcow API Response Handling

Mailcow returns an array of `{ type: "success" | "danger" | "error", msg: string[], log: unknown[] }`. The client treats the first entry with `type === "error"` or `type === "danger"` as failure and surfaces `msg` to the user.

## local_part Validation

`isValidMailcowLocalPart()` enforces:

- Allowed characters: letters, digits, hyphens, underscores, dots
- Length: 1–64
- Trimmed and lowercased
- Rejects `@`, spaces, and empty input

## Related Documentation

- [INTEGRATIONS.md](./INTEGRATIONS.md) – Integrations framework overview and architecture.
- [IRC.md](./IRC.md) – IRC integration (similar per-integration table pattern).
