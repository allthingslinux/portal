import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "~/core/database/schema";

import type { RecordChange, Tables } from "../record-change.type";

export function createDatabaseWebhookRouterService(
  _adminClient: PostgresJsDatabase<typeof schema>
) {
  return new DatabaseWebhookRouterService();
}

class DatabaseWebhookRouterService {
  async handleWebhook(_body: RecordChange<keyof Tables>) {
    return;
  }
}
