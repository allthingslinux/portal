import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "~/core/database/schema";

import type { RecordChange, Tables } from "../record-change.type";

export function createDatabaseWebhookRouterService(
  _adminClient: PostgresJsDatabase<typeof schema>
) {
  return new DatabaseWebhookRouterService();
}

/**
 * @name DatabaseWebhookRouterService
 * @description Service that routes the webhook event to the appropriate service
 */
class DatabaseWebhookRouterService {
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
