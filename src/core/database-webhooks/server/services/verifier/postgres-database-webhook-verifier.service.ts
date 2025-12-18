import { z } from "zod";

import type { DatabaseWebhookVerifierService } from "./database-webhook-verifier.service";

const webhooksSecret = z
  .string()
  .describe("The secret used to verify the webhook signature")
  .min(1)
  .parse(process.env.DATABASE_WEBHOOK_SECRET);

export function createDatabaseWebhookVerifierService() {
  return new PostgresDatabaseWebhookVerifierService();
}

class PostgresDatabaseWebhookVerifierService
  implements DatabaseWebhookVerifierService
{
  verifySignatureOrThrow(header: string) {
    if (header !== webhooksSecret) {
      throw new Error("Invalid signature");
    }

    return Promise.resolve(true);
  }
}
