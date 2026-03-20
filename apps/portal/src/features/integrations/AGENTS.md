# src/features/integrations

> Scope: IRC, XMPP, Mailcow, and Discord integration — UI, API, and backend clients.

## What Lives Here

| Directory | Purpose |
|-----------|---------|
| `lib/core/` | Base types, integration registry, shared utilities |
| `lib/irc/` | IRC integration (Atheme JSON-RPC + UnrealIRCd client) |
| `lib/xmpp/` | XMPP integration (Prosody REST client) |
| `lib/mailcow/` | mailcow integration (REST API for mailbox provisioning) |
| `lib/discord/` | Discord integration (`client.ts`, `keys.ts`) |
| `lib/bridge/` | Bridge ↔ Portal identity env (`keys.ts` — e.g. `BRIDGE_SERVICE_TOKEN`) |
| `lib/mediawiki/` | MediaWiki API client (wiki account sync) |
| `components/` | Integration UI (status cards, account forms) |
| `hooks/` | TanStack Query hooks for integration data |
| `api/` | Integration API route handler wrappers |

## Integration Architecture

```
lib/core/              ← registry, factory, base types, constants, user-deletion helpers
  ├── types.ts, base.ts, registry.ts, factory.ts, constants.ts, user-deletion.ts

lib/bridge/
  └── keys.ts            ← Portal bridge identity env (server-only)

lib/irc/
  ├── config.ts, keys.ts, implementation.ts, types.ts, utils.ts, index.ts
  ├── atheme/            ← Atheme JSON-RPC client (server-only)
  └── unreal/            ← UnrealIRCd JSON-RPC / related client (server-only)

lib/xmpp/
  ├── config.ts, keys.ts, client.ts, implementation.ts, types.ts, utils.ts, index.ts

lib/discord/
  ├── client.ts, keys.ts

lib/mediawiki/
  ├── client.ts, bot-client.ts, implementation.ts, keys.ts, types.ts, index.ts
```

## Key Concepts

**Integration statuses** — defined in `INTEGRATION_STATUSES` constant:

- `active` — account is provisioned and accessible
- `suspended` — exists but access is blocked
- `deleted` — soft-deleted, nick/JID may not be reused

**UnrealIRCd client** (`lib/irc/unreal/`) — UnrealIRCd **JSON-RPC** over HTTPS (`IRC_UNREAL_JSONRPC_URL`). **Server-only.** Never import in client components.

**Atheme client** (`lib/irc/atheme/`) — uses **JSON-RPC** to talk to Atheme (`/jsonrpc`). **Server-only.** Fault codes are typed via `AnyAthemeFaultCode`.

**Prosody REST client** (`lib/xmpp/`) — talks to Prosody's REST API for XMPP account management. **Server-only.**

**Mailcow client** (`lib/mailcow/`) — talks to Mailcow REST API for mailbox provisioning (add/edit/delete/get). **Server-only.** Auth via `X-API-Key`.

## Usage Patterns

```typescript
// Always server-side — in API route handlers
import { createIrcAccount } from "@/features/integrations/lib/irc"

// Client — TanStack Query hooks for reading integration status
import { useIntegrations } from "@/features/integrations/hooks/use-integration"
const { data: integrations, isLoading } = useIntegrations()
```

## Environment Variables

Each integration has its own `keys.ts`. Key vars:

- IRC: `IRC_SERVER`, `IRC_PORT`, `IRC_ATHEME_JSONRPC_URL`, `IRC_ATHEME_OPER_ACCOUNT`, `IRC_ATHEME_OPER_PASSWORD`, `IRC_UNREAL_JSONRPC_URL`
- XMPP: `XMPP_DOMAIN`, `PROSODY_REST_URL`, `PROSODY_REST_TOKEN`
- mailcow: `MAILCOW_API_URL`, `MAILCOW_API_KEY`, `MAILCOW_DOMAIN`
- Discord: `DISCORD_BOT_TOKEN`, `NEXT_PUBLIC_DISCORD_GUILD_ID`
- MediaWiki: `WIKI_API_URL` (default: <https://atl.wiki/api.php>)

## Critical Rules

- **Atheme, UnrealIRCd, and Prosody clients are server-only** — never import them in client components or pages without `"use server"`.
- **Check `active` status before provisioning** — prevent duplicate accounts.
- **Soft-deleted accounts** (`deleted` status) should not block nick/JID reuse — always filter by status when checking availability.
- Integration mutations must call `pnpm fix` before committing — the Atheme fault code types are delicate.
