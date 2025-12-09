import "server-only";

import { getDrizzleSupabaseAdminClient } from "~/core/database/supabase/clients/drizzle-client";
import { getLogger } from "~/shared/logger";

import type { RecordChange, Tables } from "../record-change.type";
import { createDatabaseWebhookRouterService } from "./database-webhook-router.service";
import { getDatabaseWebhookVerifier } from "./verifier";

/**
 * @name DatabaseChangePayload
 * @description Payload for the database change event. Useful for handling custom webhooks.
 */
export type DatabaseChangePayload<Table extends keyof Tables> =
  RecordChange<Table>;

export function getDatabaseWebhookHandlerService() {
  return new DatabaseWebhookHandlerService();
}

/**
 * @name getDatabaseWebhookHandlerService
 * @description Get the database webhook handler service
 */
class DatabaseWebhookHandlerService {
  private readonly namespace = "database-webhook-handler";

  /**
   * @name handleWebhook
   * @description Handle the webhook event
   * @param params
   */
  async handleWebhook(params: {
    body: RecordChange<keyof Tables>;
    signature: string;
    handleEvent?<Table extends keyof Tables>(
      payload: Table extends keyof Tables ? DatabaseChangePayload<Table> : never
    ): unknown;
  }) {
    const logger = await getLogger();
    const { table, type } = params.body;

    const ctx = {
      name: this.namespace,
      table,
      type,
    };

    logger.info(ctx, "Received webhook from DB. Processing...");

    // check if the signature is valid
    const verifier = await getDatabaseWebhookVerifier();

    await verifier.verifySignatureOrThrow(params.signature);

    // all good, we can now the webhook

    // create a client with admin access since we are handling webhooks and no user is authenticated
    const adminClient = getDrizzleSupabaseAdminClient();

    const service = createDatabaseWebhookRouterService(adminClient);

    try {
      // handle the webhook event based on the table
      await service.handleWebhook(params.body);

      // if a custom handler is provided, call it
      if (params?.handleEvent) {
        await params.handleEvent(
          params.body as DatabaseChangePayload<keyof Tables>
        );
      }

      logger.info(ctx, "Webhook processed successfully");
    } catch (error) {
      logger.error(
        {
          ...ctx,
          error,
        },
        "Failed to process webhook"
      );

      throw error;
    }
  }
}
