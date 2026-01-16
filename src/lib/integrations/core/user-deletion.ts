import "server-only";

import { captureException } from "@sentry/nextjs";

import { registerIntegrations } from "@/lib/integrations";
import { getIntegrationRegistry } from "./registry";

/**
 * Cleanup all integration accounts for a user before deletion.
 */
export async function cleanupIntegrationAccounts(
  userId: string
): Promise<void> {
  registerIntegrations();
  const integrations = getIntegrationRegistry().getAll();

  for (const integration of integrations) {
    try {
      const account = await integration.getAccount(userId);
      if (account) {
        await integration.deleteAccount(account.id);
      }
    } catch (error) {
      try {
        captureException(error, {
          tags: {
            integration: integration.id,
            userId,
          },
        });
      } catch {
        // Ignore logging failures during cleanup.
      }
    }
  }
}
