import "server-only";

import { db } from "~/lib/database/client";
import { notifications } from "~/lib/database/schema";
import { getLogger } from "~/shared/logger";

type Notification = typeof notifications.$inferInsert;

export function createNotificationsService() {
  return new NotificationsService();
}

class NotificationsService {
  async createNotification(params: Notification) {
    const logger = await getLogger();
    const client = db;

    const ctx = {
      name: "notifications.create",
      type: params.type,
      channel: params.channel,
    };

    logger.info(ctx, "Creating notification");

    try {
      await client.insert(notifications).values(params);

      logger.info(ctx, "Notification created successfully");
    } catch (error) {
      logger.error({ ...ctx, error }, "Failed to create notification");
      throw error;
    }
  }
}
