import type { NextRequest } from "next/server";
import { APIError, handleAPIError, requireAuth } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { account } from "@portal/db/schema/auth";
import { ircAccount } from "@portal/db/schema/irc";
import { xmppAccount } from "@portal/db/schema/xmpp";
import { and, eq } from "drizzle-orm";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/bridge/identity
 *
 * Cross-protocol identity lookup for the bridge service.
 * Accepts either:
 *   - A service token via BRIDGE_SERVICE_TOKEN env var (for bridge ↔ portal)
 *   - A valid user session (Bearer token via better-auth)
 *
 * Query params (exactly one required):
 *   - discordId: look up by Discord snowflake
 *   - ircNick:   look up by IRC nick
 *   - xmppJid:   look up by XMPP JID
 *
 * Response body (HTTP 200):
 *   { ok: true, identity: { user_id, discord_id, irc_nick, irc_status,
 *                            xmpp_jid, xmpp_username, xmpp_status } }
 *
 * Note: irc_server is intentionally omitted — single-server deployment (irc.atl.chat).
 *
 * Returns 404 when no matching account is found.
 * Returns 400 when no valid query param is provided.
 */

/**
 * Authenticate via BRIDGE_SERVICE_TOKEN or fall back to better-auth session.
 */
async function requireBridgeAuth(request: NextRequest): Promise<void> {
  const serviceToken = process.env.BRIDGE_SERVICE_TOKEN;
  if (serviceToken) {
    const authHeader = request.headers.get("authorization");
    if (authHeader === `Bearer ${serviceToken}`) {
      return; // Service token matched
    }
  }
  // Fall back to better-auth session (user sessions still work)
  await requireAuth(request);
}

async function fetchIrcForUser(userId: string) {
  const [irc] = await db
    .select({ nick: ircAccount.nick, status: ircAccount.status })
    .from(ircAccount)
    .where(eq(ircAccount.userId, userId))
    .limit(1);
  return irc ?? null;
}

async function fetchXmppForUser(userId: string) {
  const [xmpp] = await db
    .select({
      jid: xmppAccount.jid,
      username: xmppAccount.username,
      status: xmppAccount.status,
    })
    .from(xmppAccount)
    .where(eq(xmppAccount.userId, userId))
    .limit(1);
  return xmpp ?? null;
}

async function fetchDiscordForUser(userId: string) {
  const [discord] = await db
    .select({ accountId: account.accountId })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "discord")))
    .limit(1);
  return discord ?? null;
}

async function lookupByDiscordId(discordId: string) {
  const [discordAccount] = await db
    .select({ userId: account.userId })
    .from(account)
    .where(
      and(eq(account.providerId, "discord"), eq(account.accountId, discordId))
    )
    .limit(1);

  if (!discordAccount) {
    return Response.json(
      { ok: false, error: "Discord account not linked" },
      { status: 404 }
    );
  }

  const { userId } = discordAccount;
  const [irc, xmpp] = await Promise.all([
    fetchIrcForUser(userId),
    fetchXmppForUser(userId),
  ]);

  return Response.json({
    ok: true,
    identity: {
      user_id: userId,
      discord_id: discordId,
      irc_nick: irc?.nick ?? null,
      irc_status: irc?.status ?? null,
      xmpp_jid: xmpp?.jid ?? null,
      xmpp_username: xmpp?.username ?? null,
      xmpp_status: xmpp?.status ?? null,
    },
  });
}

async function lookupByIrcNick(ircNick: string) {
  const [active] = await db
    .select()
    .from(ircAccount)
    .where(eq(ircAccount.nick, ircNick))
    .limit(1);

  if (!active) {
    return Response.json(
      { ok: false, error: "IRC account not found" },
      { status: 404 }
    );
  }

  const [xmpp, discordAcc] = await Promise.all([
    fetchXmppForUser(active.userId),
    fetchDiscordForUser(active.userId),
  ]);

  return Response.json({
    ok: true,
    identity: {
      user_id: active.userId,
      discord_id: discordAcc?.accountId ?? null,
      irc_nick: active.nick,
      irc_status: active.status,
      xmpp_jid: xmpp?.jid ?? null,
      xmpp_username: xmpp?.username ?? null,
      xmpp_status: xmpp?.status ?? null,
    },
  });
}

async function lookupByXmppJid(xmppJid: string) {
  const [xmpp] = await db
    .select()
    .from(xmppAccount)
    .where(eq(xmppAccount.jid, xmppJid))
    .limit(1);

  if (!xmpp) {
    return Response.json(
      { ok: false, error: "XMPP account not found" },
      { status: 404 }
    );
  }

  const [irc, discordAcc] = await Promise.all([
    fetchIrcForUser(xmpp.userId),
    fetchDiscordForUser(xmpp.userId),
  ]);

  return Response.json({
    ok: true,
    identity: {
      user_id: xmpp.userId,
      discord_id: discordAcc?.accountId ?? null,
      irc_nick: irc?.nick ?? null,
      irc_status: irc?.status ?? null,
      xmpp_jid: xmpp.jid,
      xmpp_username: xmpp.username,
      xmpp_status: xmpp.status,
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    await requireBridgeAuth(request);

    const { searchParams } = new URL(request.url);

    const discordId = searchParams.get("discordId");
    const ircNick = searchParams.get("ircNick");
    const xmppJid = searchParams.get("xmppJid");

    if (!(discordId || ircNick || xmppJid)) {
      throw new APIError("Provide one of: discordId, ircNick, xmppJid", 400);
    }

    if (discordId) {
      return lookupByDiscordId(discordId);
    }
    if (ircNick) {
      return lookupByIrcNick(ircNick);
    }

    return lookupByXmppJid(xmppJid ?? "");
  } catch (error) {
    return handleAPIError(error);
  }
}
