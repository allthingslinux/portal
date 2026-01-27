import "server-only";

import { getIntegrationRegistry } from "./registry";
import type { Integration } from "./types";

/**
 * Get an integration by ID or throw if missing.
 */
export function getIntegrationOrThrow(id: string): Integration {
  const integration = getIntegrationRegistry().get(id);

  if (!integration) {
    throw new Error(`Unknown integration: ${id}`);
  }

  return integration;
}
