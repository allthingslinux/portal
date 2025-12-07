'use server';

import { and, eq, gt, inArray, sql } from 'drizzle-orm';

import { getDrizzleSupabaseClient } from '~/core/database/supabase/clients/drizzle-client';
import { notifications } from '~/core/database/supabase/drizzle/schema';

/**
 * Dismiss a notification
 */
export async function dismissNotificationAction(notificationId: number) {
  const drizzleClient = await getDrizzleSupabaseClient();

  await drizzleClient.runTransaction(async (tx) => {
    await tx
      .update(notifications)
      .set({ dismissed: true })
      .where(eq(notifications.id, notificationId));
  });
}

/**
 * Fetch notifications for given account IDs
 */
export async function fetchNotificationsAction(accountIds: string[]) {
  const drizzleClient = await getDrizzleSupabaseClient();
  const now = new Date().toISOString();

  const result = (await drizzleClient.runTransaction(async (tx) => {
    return await tx
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
          sql`${notifications.expiresAt} > ${now}`,
        ),
      )
      .orderBy(sql`${notifications.createdAt} DESC`)
      .limit(10);
  })) as Array<{
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
    type: n.type,
    created_at: n.createdAt,
    link: n.link,
  }));
}

