import type { NextRequest } from "next/server";
import { handleAPIError, requireAdminOrStaff } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { ircAccount } from "@portal/db/schema/irc";
import { mailcowAccount } from "@portal/db/schema/mailcow";
import { mediawikiAccount } from "@portal/db/schema/mediawiki";
import { xmppAccount } from "@portal/db/schema/xmpp";
import { UserSearchSchema } from "@portal/schemas/user";
import { and, desc, eq, ilike, ne, or } from "drizzle-orm";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const { role, banned, search, expand, limit, offset } =
      UserSearchSchema.parse(Object.fromEntries(searchParams));

    // Build where conditions
    const conditions: ReturnType<typeof eq | typeof or>[] = [];
    if (role) {
      conditions.push(eq(user.role, role));
    }
    if (banned !== undefined) {
      conditions.push(eq(user.banned, banned));
    }
    if (search) {
      const searchCondition = or(
        ilike(user.email, `%${search}%`),
        ilike(user.name, `%${search}%`),
        ilike(user.username, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (expand === "integrations") {
      const [rows, [{ count }]] = await Promise.all([
        db
          .select({
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            image: user.image,
            role: user.role,
            banned: user.banned,
            banReason: user.banReason,
            banExpires: user.banExpires,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            emailVerified: user.emailVerified,
            twoFactorEnabled: user.twoFactorEnabled,
            ircNick: ircAccount.nick,
            ircStatus: ircAccount.status,
            xmppJid: xmppAccount.jid,
            xmppUsername: xmppAccount.username,
            xmppStatus: xmppAccount.status,
            mailcowEmail: mailcowAccount.email,
            mailcowStatus: mailcowAccount.status,
            mediawikiWikiUsername: mediawikiAccount.wikiUsername,
            mediawikiStatus: mediawikiAccount.status,
          })
          .from(user)
          .leftJoin(
            ircAccount,
            and(
              eq(ircAccount.userId, user.id),
              ne(ircAccount.status, "deleted")
            )
          )
          .leftJoin(
            xmppAccount,
            and(
              eq(xmppAccount.userId, user.id),
              ne(xmppAccount.status, "deleted")
            )
          )
          .leftJoin(
            mailcowAccount,
            and(
              eq(mailcowAccount.userId, user.id),
              ne(mailcowAccount.status, "deleted")
            )
          )
          .leftJoin(
            mediawikiAccount,
            and(
              eq(mediawikiAccount.userId, user.id),
              ne(mediawikiAccount.status, "deleted")
            )
          )
          .where(whereClause)
          .orderBy(desc(user.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: db.$count(user, whereClause) })
          .from(user)
          .limit(1),
      ]);

      const users = rows.map((row) => ({
        id: row.id,
        name: row.name,
        username: row.username,
        email: row.email,
        image: row.image,
        role: row.role,
        banned: row.banned,
        banReason: row.banReason,
        banExpires: row.banExpires,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        emailVerified: row.emailVerified,
        twoFactorEnabled: row.twoFactorEnabled,
        ircAccount: row.ircNick
          ? { nick: row.ircNick, status: row.ircStatus }
          : null,
        xmppAccount: row.xmppJid
          ? {
              jid: row.xmppJid,
              username: row.xmppUsername,
              status: row.xmppStatus,
            }
          : null,
        mailcowAccount: row.mailcowEmail
          ? { email: row.mailcowEmail, status: row.mailcowStatus }
          : null,
        mediawikiAccount: row.mediawikiWikiUsername
          ? {
              wikiUsername: row.mediawikiWikiUsername,
              status: row.mediawikiStatus,
            }
          : null,
      }));

      return Response.json({
        users,
        pagination: {
          total: count,
          limit,
          offset,
          hasMore: offset + limit < count,
        },
      });
    }

    const [users, [{ count }]] = await Promise.all([
      db
        .select()
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: db.$count(user, whereClause) })
        .from(user)
        .limit(1),
    ]);

    return Response.json({
      users,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < count,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
