import "server-only";

import { captureException } from "@sentry/nextjs";

import { getIntegrationRegistry } from "./registry";
import { registerIntegrations } from "@/features/integrations/lib/integrations";

/**
 * Cleanup all integration accounts for a user before deletion.
 */
export async function cleanupIntegrationAccounts(
  userId: string
): Promise<void> {
  registerIntegrations();
  const integrations = getIntegrationRegistry().getAll();

  // Run cleanup in parallel for better performance
  const cleanupPromises = integrations.map(async (integration) => {
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
  });

  // Use allSettled to ensure all cleanups are attempted even if some fail
  await Promise.allSettled(cleanupPromises);
}
