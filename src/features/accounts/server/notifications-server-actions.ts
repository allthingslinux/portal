"use server";

import { and, eq, inArray, sql } from "drizzle-orm";

import { db } from "~/core/database/client";
import { notifications } from "~/core/database/schema";
import type { Notification } from "~/features/notifications/types";

/**
 * Dismiss a notification
 */
export async function dismissNotificationAction(notificationId: number) {
  await db
    .update(notifications)
    .set({ dismissed: true })
    .where(eq(notifications.id, notificationId));
}

/**
 * Fetch notifications for given account IDs
 */
export async function fetchNotificationsAction(
  accountIds: string[]
): Promise<Notification[]> {
  const now = new Date().toISOString();

  const result = (await db
    .select({
      id: notifications.id,
      body: notifications.body,
      dismissed: notifications.dismissed,
      type: notifications.type,
      createdAt: notifications.createdAt,
      link: notifications.link,
    })
    .from(notifications)
    .where(
      and(
        inArray(notifications.accountId, accountIds),
        eq(notifications.dismissed, false),
        sql`${notifications.expiresAt} > ${now}`
      )
    )
    .orderBy(sql`${notifications.createdAt} DESC`)
    .limit(10)) as Array<{
    id: number;
    body: string;
    dismissed: boolean;
    type: string;
    createdAt: string;
    link: string | null;
  }>;

  return result.map((n) => ({
    id: n.id,
    body: n.body,
    dismissed: n.dismissed,
    type: n.type as Notification["type"],
    created_at: n.createdAt,
    link: n.link,
  }));
}
