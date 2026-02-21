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
 *   - discordId: look up by Discord snowflake → returns { user_id, discord_id, irc_nick?, irc_server?, xmpp_jid?, xmpp_username? }
 *   - ircNick:   look up by IRC nick → returns { user_id, irc_nick, irc_server, irc_status, xmpp_jid?, xmpp_username?, discord_id? }
 *   - ircServer: optional filter when using ircNick
 *   - xmppJid:   look up by XMPP JID → returns { user_id, xmpp_jid, xmpp_username, xmpp_status, irc_nick?, irc_server?, discord_id? }
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
                    user_id: userId,
                    discord_id: discordId,
                    irc_nick: irc?.nick ?? null,
                    irc_server: irc?.server ?? null,
                    irc_status: irc?.status ?? null,
                    xmpp_jid: xmpp?.jid ?? null,
                    xmpp_username: xmpp?.username ?? null,
                    xmpp_status: xmpp?.status ?? null,
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

            // Fetch linked XMPP account for the same user
            const [xmpp] = await db
                .select({ jid: xmppAccount.jid, username: xmppAccount.username })
                .from(xmppAccount)
                .where(eq(xmppAccount.userId, active.userId))
                .limit(1);

            // Fetch linked Discord account for the same user
            const [discordAcc] = await db
                .select({ accountId: account.accountId })
                .from(account)
                .where(
                    and(
                        eq(account.userId, active.userId),
                        eq(account.providerId, "discord")
                    )
                )
                .limit(1);

            return Response.json({
                ok: true,
                identity: {
                    user_id: active.userId,
                    irc_nick: active.nick,
                    irc_server: active.server,
                    irc_status: active.status,
                    xmpp_jid: xmpp?.jid ?? null,
                    xmpp_username: xmpp?.username ?? null,
                    discord_id: discordAcc?.accountId ?? null,
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

        // Fetch linked IRC account for the same user
        const [irc] = await db
            .select({ nick: ircAccount.nick, server: ircAccount.server })
            .from(ircAccount)
            .where(eq(ircAccount.userId, xmpp.userId))
            .limit(1);

        // Fetch linked Discord account for the same user
        const [discordAcc] = await db
            .select({ accountId: account.accountId })
            .from(account)
            .where(
                and(
                    eq(account.userId, xmpp.userId),
                    eq(account.providerId, "discord")
                )
            )
            .limit(1);

        return Response.json({
            ok: true,
            identity: {
                user_id: xmpp.userId,
                xmpp_jid: xmpp.jid,
                xmpp_username: xmpp.username,
                xmpp_status: xmpp.status,
                irc_nick: irc?.nick ?? null,
                irc_server: irc?.server ?? null,
                discord_id: discordAcc?.accountId ?? null,
            },
        });
    } catch (error) {
        return handleAPIError(error);
    }
}
