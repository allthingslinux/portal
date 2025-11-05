/**
 * @file API for notifications
 *
 * Usage
 *
 * ```typescript
 * import { createNotificationsApi } from '@portal/notifications/api';
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
import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@portal/supabase/database';

import { createNotificationsService } from './notifications.service.drizzle';

type Notification = Database['public']['Tables']['notifications'];

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
  createNotification(params: Notification['Insert']) {
    return this.service.createNotification(params);
  }
}
