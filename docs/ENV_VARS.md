# Environment variables

This document is the canonical environment-variable reference for the Portal
repo and the cross-repo bridge contract with `atl.chat`.

## Portal (`apps/portal/.env`)

Use `apps/portal/.env.example` as your starting point.

### Required

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

### Bridge integration

- `BRIDGE_SERVICE_TOKEN` (must equal `atl.chat` `BRIDGE_PORTAL_TOKEN`)

### Optional integrations

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `NEXT_PUBLIC_DISCORD_GUILD_ID`
- `IRC_SERVER`
- `IRC_PORT`
- `IRC_ATHEME_JSONRPC_URL`
- `IRC_ATHEME_INSECURE_SKIP_VERIFY`
- `IRC_ATHEME_OPER_ACCOUNT`
- `IRC_ATHEME_OPER_PASSWORD`
- `IRC_UNREAL_JSONRPC_URL`
- `IRC_UNREAL_RPC_USER`
- `IRC_UNREAL_RPC_PASSWORD`
- `IRC_UNREAL_INSECURE_SKIP_VERIFY`
- `XMPP_DOMAIN`
- `PROSODY_REST_URL`
- `PROSODY_REST_TOKEN`
- `MAILCOW_API_URL`
- `MAILCOW_API_KEY`
- `MAILCOW_DOMAIN`
- `MAILCOW_OAUTH_CLIENT_ID`
- `MAILCOW_OAUTH_CLIENT_SECRET`
- `NEXT_PUBLIC_MAILCOW_WEB_URL`
- `NEXT_PUBLIC_MAILCOW_OAUTH_ENABLED`
- `WIKI_API_URL`
- `WIKI_BOT_USERNAME`
- `WIKI_BOT_PASSWORD`

### Observability and tooling

- `SENTRY_DSN`
- `GITHUB_TOKEN`
- `NEXT_PUBLIC_DEV_TOOLS_ENABLED`

## atl.chat env model

`atl.chat` uses an explicit layered model:

1. `.env` for shared baseline values.
2. `.env.dev` for local development overrides.
3. `.env.prod` for production overrides.

Execution entrypoints:

- `just dev` => `scripts/init.sh dev` + compose with `.env` and `.env.dev`
- `just prod` => `scripts/init.sh prod` + compose with `.env` and `.env.prod`

No runtime behavior depends on `ATL_ENVIRONMENT`.

## Bridge token mapping

Cross-repo bridge auth requires the same secret under different names:

- Portal: `BRIDGE_SERVICE_TOKEN`
- atl.chat: `BRIDGE_PORTAL_TOKEN`

## Removed legacy env names

The bridge no longer accepts these aliases:

- `BRIDGE_PORTAL_URL`
- `BRIDGE_PORTAL_API_TOKEN`
