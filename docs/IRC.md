# IRC Integration

The Portal IRC integration provisions NickServ accounts on the atl.chat IRC network via Atheme's JSON-RPC API. Users create one IRC account per Portal identity; passwords are generated once and never stored.

## Overview

- **Location**: `src/features/integrations/lib/irc/`
- **External Services**:
  - **Atheme JSON-RPC** (required): Provisions NickServ accounts (`REGISTER` command).
  - **UnrealIRCd JSON-RPC** (optional): Admin-only; user list, channel list, "who's online".
- **Database**: Dedicated `irc_account` table (one account per user).
- **Password Handling**: Cryptographically random password generated on create; returned once to the user. Never stored in Portal.

## Module Structure

```
src/features/integrations/lib/irc/
├── atheme/           # Atheme JSON-RPC client
│   └── client.ts     # registerNick() via atheme.command
├── unreal/           # UnrealIRCd JSON-RPC client (admin)
│   ├── client.ts     # userList, userGet, channelList, channelGet
│   └── types.ts      # UnrealClient, UnrealChannel DTOs
├── keys.ts           # Environment variable validation (t3-env)
├── config.ts         # ircConfig, isIrcConfigured(), isUnrealConfigured()
├── types.ts          # IrcAccount, CreateIrcAccountRequest, AthemeFault
├── utils.ts          # isValidIrcNick(), generateIrcPassword()
├── implementation.ts # IrcIntegration class and registration
└── index.ts          # Public exports
```

## Environment Variables

### Atheme (Required for Provisioning)

| Variable | Required | Description |
|----------|----------|-------------|
| `IRC_ATHEME_JSONRPC_URL` | Yes | Full URL to Atheme JSON-RPC endpoint (e.g. `https://irc.atl.chat:8081/jsonrpc`) |
| `IRC_ATHEME_INSECURE_SKIP_VERIFY` | No | `true` or `1` to skip TLS verification (internal/self-signed) |
| `IRC_SERVER` | No | Server host for UI connect instructions (default: `irc.atl.chat`) |
| `IRC_PORT` | No | Port for UI (default: `6697`, TLS) |

### UnrealIRCd (Optional, Admin Only)

| Variable | Required | Description |
|----------|----------|-------------|
| `IRC_UNREAL_JSONRPC_URL` | Yes* | Base URL to UnrealIRCd JSON-RPC (e.g. `https://irc.atl.chat/jsonrpc`) |
| `IRC_UNREAL_RPC_USER` | Yes* | RPC username for Basic Auth |
| `IRC_UNREAL_RPC_PASSWORD` | Yes* | RPC password for Basic Auth |
| `IRC_UNREAL_INSECURE_SKIP_VERIFY` | No | `true` or `1` to skip TLS verification |

\*All three (`*_URL`, `*_RPC_USER`, `*_RPC_PASSWORD`) must be set for Unreal to be considered configured.

## Database Schema

```sql
-- irc_account table
CREATE TABLE irc_account (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  nick TEXT NOT NULL UNIQUE,
  server TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 6697,
  status irc_account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Enum: active, suspended, deleted
-- Indexes: userId, nick, status
```

- **One account per user**: `user_id` is unique.
- **No password stored**: Password is generated, sent to Atheme, and returned once to the user.
- **Soft delete**: Deleting in Portal sets `status = 'deleted'`; the NickServ account remains on Atheme.

## User Flow

1. User opens **Integrations** and selects IRC.
2. User enters a nick (required; no auto-generate in v1).
3. Portal validates the nick (RFC 1459 style: letters, digits, `[\]^_`{|}~`, `-`; max 50 chars).
4. Portal generates a one-time password and calls Atheme `atheme.command` → NickServ `REGISTER`.
5. On success, Portal inserts an `irc_account` row and returns the account with `temporaryPassword`.
6. User must identify to NickServ on first connect using the displayed password.
7. User can change their NickServ password via `/msg NickServ SET PASSWORD` after identifying.

## API

The IRC integration uses the unified integrations API (no IRC-specific routes):

- **Create**: `POST /api/integrations/irc/accounts` with body `{ "nick": "mynick" }`. Returns `{ account, temporaryPassword }`.
- **Get**: `GET /api/integrations/irc/accounts` (current user) or `GET /api/integrations/irc/accounts/[id]` (owner or admin).
- **Update**: `PATCH /api/integrations/irc/accounts/[id]` (status, metadata; nick change not supported).
- **Delete**: `DELETE /api/integrations/irc/accounts/[id]` (soft-delete; NickServ account remains).

## Admin

### User Detail View

Admin user detail sheet (Users tab → user icon) shows IRC account (nick, server, port, status) when present.

### IRC Accounts List

Admin dashboard → **IRC Accounts** tab lists all IRC accounts with user email, nick, server:port, status, and created date. Pagination and optional `status` filter via `GET /api/admin/irc-accounts`.

### UnrealIRCd Client

When Unreal env vars are set, use `unrealRpcClient` from `@/features/integrations/lib/irc`:

```typescript
import { unrealRpcClient, isUnrealConfigured } from "@/features/integrations/lib/irc";

if (isUnrealConfigured()) {
  const users = await unrealRpcClient.userList();        // All connected users
  const user = await unrealRpcClient.userGet("mynick");  // Single user by nick
  const channels = await unrealRpcClient.channelList();  // All channels
  const channel = await unrealRpcClient.channelGet("#atl");  // Single channel
}
```

- `user.list`, `user.get`: `object_detail_level` 0, 1, 2, or 4.
- `channel.list`, `channel.get`: `object_detail_level` 1–4.

Use for admin "who's online" or channel list views.

## Authentication Claims

When the `irc` scope is requested (OAuth/OpenID Connect), `customUserInfoClaims` adds `irc_nick` to the user info when the user has an IRC account. Clients can use this to pre-fill nick in IRC clients or display IRC identity.

## Atheme Prerequisites

The atl.chat IRC network must have:

- Atheme with `misc/httpd` and `transport/jsonrpc` modules enabled.
- JSON-RPC endpoint reachable (e.g. port 8081) and configured as `IRC_ATHEME_JSONRPC_URL`.

## Atheme Fault Codes

Atheme returns fault codes on error (see `AthemeFaultCode` in `types.ts`):

| Code | Meaning |
|------|---------|
| 1 | needmoreparams |
| 2 | badparams (invalid nick or parameters) |
| 5 | authfail |
| 6 | noprivs (frozen) |
| 8 | alreadyexists (nick already registered) |
| 9 | toomany (too many registrations) |
| 10 | emailfail |
| 15 | badauthcookie |
| 16 | internalerror |

The implementation maps these to user-friendly errors (e.g. 8 → "Nick is already registered on the IRC network").

## Nick Validation

`isValidIrcNick()` enforces:

- RFC 1459 allowed characters: `a-zA-Z0-9[\]^_`{|}~-`
- Length: 1–50 (Atheme NICKLEN)
- Trimmed (no leading/trailing spaces)

## Related Documentation

- [INTEGRATIONS.md](./INTEGRATIONS.md) – Integrations framework overview and architecture.
