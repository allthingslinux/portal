/**
 * @file API for notifications
 *
 * Usage
 *
 * ```typescript
 * import { createNotificationsApi } from '../../../api';
 *
 * const api = createNotificationsApi(client);
 *
 * await api.createNotification({
 *  body: 'Hello, world!',
 *  account_id: '123',
 *  type: 'info',
 * });
 * ```
 *
 */
import { notifications } from '~/core/database/supabase/drizzle/schema';

import { createNotificationsService } from './notifications.service';

type NotificationInsert = typeof notifications.$inferInsert;

/**
 * @name createNotificationsApi
 */
export function createNotificationsApi() {
  return new NotificationsApi();
}

/**
 * @name NotificationsApi
 */
class NotificationsApi {
  private readonly service: ReturnType<typeof createNotificationsService>;

  constructor() {
    this.service = createNotificationsService();
  }

  /**
   * @name createNotification
   * @description Create a new notification in the database
   * @param params
   */
  createNotification(params: NotificationInsert) {
    return this.service.createNotification(params);
  }
}
