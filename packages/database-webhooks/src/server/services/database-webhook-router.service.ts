import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@portal/supabase/database';

import { RecordChange, Tables } from '../record-change.type';

export function createDatabaseWebhookRouterService(
  adminClient: SupabaseClient<Database>,
) {
  return new DatabaseWebhookRouterService(adminClient);
}

/**
 * @name DatabaseWebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 */
class DatabaseWebhookRouterService {
  constructor(private readonly adminClient: SupabaseClient<Database>) {}

  /**
   * @name handleWebhook
   * @description Handle the webhook event
   * @param _body
   */
  async handleWebhook(_body: RecordChange<keyof Tables>) {
    // Add webhook handlers here as needed
    return;
  }
}
