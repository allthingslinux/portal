# src/features/integrations

> Scope: IRC, XMPP, and Discord integration — UI, API, and backend clients.

## What Lives Here

| Directory | Purpose |
|-----------|---------|
| `lib/core/` | Base types, integration registry, shared utilities |
| `lib/irc/` | IRC integration (Atheme RPC + UnrealIRCd client) |
| `lib/xmpp/` | XMPP integration (Prosody REST client) |
| `lib/discord/` | Discord integration (REST API client) |
| `lib/mediawiki/` | MediaWiki API client (wiki account sync) |
| `components/` | Integration UI (status cards, account forms) |
| `hooks/` | TanStack Query hooks for integration data |
| `api/` | Integration API route handler wrappers |

## Integration Architecture

```
lib/core/        ← shared base types, registry, constants
  ├── types.ts   ← IntegrationAccount, IntegrationStatus, etc.
  └── constants.ts ← UI labels, status display values

lib/irc/
  ├── config.ts        ← IRC server connection config (env vars via keys.ts)
  ├── keys.ts          ← IRC env vars (IRC_HOST, IRC_PORT, ATHEME_*)
  ├── implementation.ts ← IRC integration logic (account creation, nick checks)
  ├── types.ts         ← IRC-specific types
  ├── atheme/          ← Atheme XML-RPC client (server-only)
  └── unreal/          ← UnrealIRCd client (server-only) — websocket bridge

lib/xmpp/
  ├── config.ts        ← Prosody connection config (env vars via keys.ts)
  ├── keys.ts          ← XMPP env vars (XMPP_DOMAIN, PROSODY_REST_URL, etc.)
  └── ...

lib/discord/
  ├── client.ts        ← Discord REST API client (bot token auth)
  └── ...

lib/mediawiki/
  ├── client.ts        ← MediaWiki API client (server-only)
  ├── keys.ts          ← MediaWiki env vars
  └── index.ts         ← Barrel export
```

## Key Concepts

**Integration statuses** — defined in `INTEGRATION_STATUSES` constant:
- `active` — account is provisioned and accessible
- `suspended` — exists but access is blocked
- `deleted` — soft-deleted, nick/JID may not be reused

**UnrealIRCd client** (`lib/irc/unreal/`) — communicates with UnrealIRCd over a websocket bridge. **Server-only.** Never import in client components.

**Atheme client** (`lib/irc/atheme/`) — uses XML-RPC to talk to Atheme services (NickServ, ChanServ). **Server-only.** Fault codes are typed via `AnyAthemeFaultCode`.

**Prosody REST client** (`lib/xmpp/`) — talks to Prosody's REST API for XMPP account management. **Server-only.**

## Usage Patterns

```typescript
// Always server-side — in API route handlers
import { createIrcAccount } from "@/features/integrations/lib/irc"

// Client — TanStack Query hooks for reading integration status
import { useIntegrations } from "@/features/integrations/hooks/use-integrations"
const { data: integrations, isLoading } = useIntegrations()
```

## Environment Variables

Each integration has its own `keys.ts`. Key vars:
- IRC: `IRC_HOST`, `IRC_PORT`, `ATHEME_USERNAME`, `ATHEME_PASSWORD`, `UNREAL_WS_URL`
- XMPP: `XMPP_DOMAIN`, `PROSODY_REST_URL`, `PROSODY_REST_SECRET`
- Discord: `DISCORD_BOT_TOKEN`, `DISCORD_GUILD_ID`
- MediaWiki: `WIKI_API_URL` (default: https://atl.wiki/api.php)

## Critical Rules

- **Atheme, UnrealIRCd, and Prosody clients are server-only** — never import them in client components or pages without `"use server"`.
- **Check `active` status before provisioning** — prevent duplicate accounts.
- **Soft-deleted accounts** (`deleted` status) should not block nick/JID reuse — always filter by status when checking availability.
- Integration mutations must call `pnpm fix` before committing — the Atheme fault code types are delicate.
