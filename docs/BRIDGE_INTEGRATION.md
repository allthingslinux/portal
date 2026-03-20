# Bridge × Portal Integration

Unified identity resolution between the atl.chat bridge (Discord↔IRC↔XMPP) and the Portal. When configured, the bridge resolves user identities across protocols so bridged messages show consistent nicknames (IRC nick, XMPP JID) instead of generic fallbacks.

For the canonical full variable inventory, use `docs/ENV_VARS.md`.

## Environment Variables Checklist

### Portal (`apps/portal/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `BRIDGE_SERVICE_TOKEN` | Yes (for bridge auth) | Bearer token for bridge→Portal API. **Must match** atl.chat's `BRIDGE_PORTAL_TOKEN` (same secret, different env names). |
| `DATABASE_URL` | Yes | PostgreSQL connection (identity lookups use `irc_account`, `xmpp_account`, `account` tables). |
| `BETTER_AUTH_SECRET` | Yes | Better Auth secret. |
| `BETTER_AUTH_URL` | Yes | Portal base URL (e.g. `http://localhost:3000`). |

**Optional (for full identity data):**

- `XMPP_DOMAIN`, `PROSODY_REST_URL`, `PROSODY_REST_TOKEN` — XMPP integration (Prosody account provisioning).
- `IRC_*` — IRC integration (Atheme/UnrealIRCd provisioning).

The bridge identity API works with whatever accounts exist in the DB; XMPP/IRC provisioning is separate.

---

### atl.chat Bridge (`.env` or `.env.dev`)

| Variable | Required | Description |
|----------|----------|-------------|
| `BRIDGE_PORTAL_BASE_URL` | Yes | Portal API base URL (e.g. `http://host.docker.internal:3000` for local, `https://portal.atl.tools` for prod). |
| `BRIDGE_PORTAL_TOKEN` | Yes | **Must match** Portal's `BRIDGE_SERVICE_TOKEN`. Bridge sends as Bearer credential. |
| `BRIDGE_DISCORD_TOKEN` | Yes | Discord bot token. |
| `BRIDGE_DISCORD_CHANNEL_ID` | Yes | Discord channel snowflake to bridge. |
| `IRC_BRIDGE_SERVER` | Yes | IRC server hostname (e.g. `atl-irc-server` in Docker). |
| `BRIDGE_XMPP_COMPONENT_JID` | Yes | XMPP component JID (e.g. `bridge.xmpp.localhost` for dev). |
| `BRIDGE_XMPP_COMPONENT_SECRET` | Yes | Shared secret with Prosody component config. |
| `BRIDGE_XMPP_COMPONENT_SERVER` | Yes | XMPP server hostname (e.g. `atl-xmpp-server`). |
| `BRIDGE_XMPP_COMPONENT_PORT` | No | Default `5347`. |
| `BRIDGE_IRC_NICK` | No | Main IRC nick (default `bridge`). |
| `BRIDGE_IRC_OPER_PASSWORD` | No | IRC oper password for bridge bot. |
| `BRIDGE_IRC_TLS_VERIFY` | No | `false` for dev with self-signed certs. |

---

### Token Mapping (Critical)

```
Portal:   BRIDGE_SERVICE_TOKEN = "your-shared-secret"
atl.chat: BRIDGE_PORTAL_TOKEN  = "your-shared-secret"
```

Both must be the **same value**. The bridge sends it as `Authorization: Bearer <token>`; Portal validates it in `GET /api/bridge/identity`.

---

### Local Development (Portal + atl.chat on same host)

- **Portal:** `BETTER_AUTH_URL=http://localhost:3000`
- **Bridge:** `BRIDGE_PORTAL_BASE_URL=http://host.docker.internal:3000` (if bridge runs in Docker)
- Or `BRIDGE_PORTAL_BASE_URL=http://localhost:3000` if bridge runs on host

---

### Verification

1. **Portal:** Ensure `BRIDGE_SERVICE_TOKEN` is set in `.env`.
2. **atl.chat:** Ensure `BRIDGE_PORTAL_BASE_URL` and `BRIDGE_PORTAL_TOKEN` are set; run `just init` to generate `config.yaml` from template.
3. **Test identity API:**

   ```bash
   curl -H "Authorization: Bearer YOUR_SHARED_SECRET" \
     "http://localhost:3000/api/bridge/identity?discordId=123456789"
   ```

   - 200 + `identity` object → OK
   - 404 → no matching account (expected if user not in Portal)
   - 401 → token mismatch or missing
