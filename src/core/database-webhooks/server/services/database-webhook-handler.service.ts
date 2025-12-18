import "server-only";

import { db } from "~/core/database/client";
import { getLogger } from "~/shared/logger";

import type { RecordChange, Tables } from "../record-change.type";
import { createDatabaseWebhookRouterService } from "./database-webhook-router.service";
import { getDatabaseWebhookVerifier } from "./verifier";

export type DatabaseChangePayload<Table extends keyof Tables> =
  RecordChange<Table>;

export function getDatabaseWebhookHandlerService() {
  return new DatabaseWebhookHandlerService();
}

class DatabaseWebhookHandlerService {
  private readonly namespace = "database-webhook-handler";

  async handleWebhook<TTable extends keyof Tables>(params: {
    body: RecordChange<TTable>;
    signature: string;
    handleEvent?(payload: DatabaseChangePayload<TTable>): unknown;
  }) {
    const logger = await getLogger();
    const { table, type } = params.body;

    const ctx = {
      name: this.namespace,
      table,
      type,
    };

    logger.info(ctx, "Received webhook from DB. Processing...");

    const verifier = await getDatabaseWebhookVerifier();
    await verifier.verifySignatureOrThrow(params.signature);

    const adminClient = db;
    const service = createDatabaseWebhookRouterService(
      adminClient as unknown as import("drizzle-orm/postgres-js").PostgresJsDatabase<
        typeof import("~/core/database/schema")
      >
    );

    try {
      await service.handleWebhook(params.body);

      if (params?.handleEvent) {
        await params.handleEvent(params.body);
      }

      logger.info(ctx, "Webhook processed successfully");
    } catch (error) {
      logger.error({ ...ctx, error }, "Failed to process webhook");
      throw error;
    }
  }
}
