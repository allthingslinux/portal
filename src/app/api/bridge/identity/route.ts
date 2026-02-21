import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { account } from "@/db/schema/auth";
import { ircAccount } from "@/db/schema/irc";
import { xmppAccount } from "@/db/schema/xmpp";
import { APIError, handleAPIError, requireAuth } from "@/shared/api/utils";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/bridge/identity
 *
 * Cross-protocol identity lookup for the bridge service.
 * Requires a valid API key (Bearer token via better-auth apiKey plugin).
 *
 * Query params (exactly one required):
 *   - discordId: look up by Discord snowflake → returns { userId, discordId, nick?, server?, jid?, username? }
 *   - ircNick:   look up by IRC nick → returns { userId, nick, server, xmppJid? }
 *   - ircServer: optional filter when using ircNick
 *   - xmppJid:   look up by XMPP JID → returns { userId, jid, username, ircNick? }
 *
 * Returns 404 when no matching account is found.
 * Returns 400 when no valid query param is provided.
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth(request);

        const { searchParams } = new URL(request.url);
        
        const discordId = searchParams.get("discordId");
        const ircNick = searchParams.get("ircNick");
        const ircServer = searchParams.get("ircServer");
        const xmppJid = searchParams.get("xmppJid");

        if (!discordId && !ircNick && !xmppJid) {
            throw new APIError(
                "Provide one of: discordId, ircNick, xmppJid",
                400
            );
        }

        if (discordId) {
            // Look up by Discord snowflake via better-auth account table
            const [discordAccount] = await db
                .select({ userId: account.userId })
                .from(account)
                .where(
                    and(
                        eq(account.providerId, "discord"),
                        eq(account.accountId, discordId)
                    )
                )
                .limit(1);

            if (!discordAccount) {
                return Response.json(
                    { ok: false, error: "Discord account not linked" },
                    { status: 404 }
                );
            }

            const { userId } = discordAccount;

            const [irc] = await db
                .select({ nick: ircAccount.nick, server: ircAccount.server, status: ircAccount.status })
                .from(ircAccount)
                .where(eq(ircAccount.userId, userId))
                .limit(1);

            const [xmpp] = await db
                .select({ jid: xmppAccount.jid, username: xmppAccount.username, status: xmppAccount.status })
                .from(xmppAccount)
                .where(eq(xmppAccount.userId, userId))
                .limit(1);

            return Response.json({
                ok: true,
                identity: {
                    userId,
                    discordId,
                    nick: irc?.nick ?? null,
                    server: irc?.server ?? null,
                    ircStatus: irc?.status ?? null,
                    jid: xmpp?.jid ?? null,
                    username: xmpp?.username ?? null,
                    xmppStatus: xmpp?.status ?? null,
                },
            });
        }

        if (ircNick) {
            // Look up by IRC nick
            const rows = await db
                .select()
                .from(ircAccount)
                .where(eq(ircAccount.nick, ircNick))
                .limit(10);

            const filtered = ircServer
                ? rows.filter((r) => r.server === ircServer)
                : rows;

            const active = filtered.find((r) => r.status === "active") ?? filtered[0];

            if (!active) {
                return Response.json(
                    { ok: false, error: "IRC account not found" },
                    { status: 404 }
                );
            }

            // Optionally fetch linked XMPP account for the same user
            const [xmpp] = await db
                .select({ jid: xmppAccount.jid, username: xmppAccount.username })
                .from(xmppAccount)
                .where(eq(xmppAccount.userId, active.userId))
                .limit(1);

            return Response.json({
                ok: true,
                identity: {
                    userId: active.userId,
                    nick: active.nick,
                    server: active.server,
                    ircStatus: active.status,
                    xmppJid: xmpp?.jid ?? null,
                    xmppUsername: xmpp?.username ?? null,
                },
            });
        }

        // Look up by XMPP JID
        const [xmpp] = await db
            .select()
            .from(xmppAccount)
            .where(eq(xmppAccount.jid, xmppJid!))
            .limit(1);

        if (!xmpp) {
            return Response.json(
                { ok: false, error: "XMPP account not found" },
                { status: 404 }
            );
        }

        // Optionally fetch linked IRC account for the same user
        const [irc] = await db
            .select({ nick: ircAccount.nick, server: ircAccount.server })
            .from(ircAccount)
            .where(eq(ircAccount.userId, xmpp.userId))
            .limit(1);

        return Response.json({
            ok: true,
            identity: {
                userId: xmpp.userId,
                jid: xmpp.jid,
                username: xmpp.username,
                xmppStatus: xmpp.status,
                ircNick: irc?.nick ?? null,
                ircServer: irc?.server ?? null,
            },
        });
    } catch (error) {
        return handleAPIError(error);
    }
}
