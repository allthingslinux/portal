import 'server-only';

import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import { notifications } from '@portal/supabase/drizzle-schema';
import { getLogger } from '@portal/shared/logger';

type Notification = typeof notifications.$inferInsert;

export function createNotificationsService() {
  return new NotificationsService();
}

class NotificationsService {
  async createNotification(params: Notification) {
    const logger = await getLogger();
    const client = await getDrizzleSupabaseClient();

    const ctx = {
      name: 'notifications.create',
      type: params.type,
      channel: params.channel,
    };

    logger.info(ctx, 'Creating notification');

    try {
      await client.runTransaction(async (tx) => {
        await tx.insert(notifications).values(params);
      });

      logger.info(ctx, 'Notification created successfully');
    } catch (error) {
      logger.error({ ...ctx, error }, 'Failed to create notification');
      throw error;
    }
  }
}
