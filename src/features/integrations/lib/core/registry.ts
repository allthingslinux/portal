import "server-only";

import type {
  Integration,
  IntegrationId,
  IntegrationPublicInfo,
} from "./types";

export class IntegrationRegistry {
  private readonly integrations = new Map<IntegrationId, Integration>();

  /**
   * Register a new integration in the registry.
   */
  register(integration: Integration): void {
    if (this.integrations.has(integration.id)) {
      throw new Error(`Integration already registered: ${integration.id}`);
    }

    this.integrations.set(integration.id, integration);
  }

  /**
   * Retrieve an integration by ID.
   */
  get(id: IntegrationId): Integration | null {
    return this.integrations.get(id) ?? null;
  }

  /**
   * Retrieve all integrations.
   */
  getAll(): Integration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Retrieve all enabled integrations.
   */
  getEnabled(): Integration[] {
    return this.getAll().filter((integration) => integration.enabled);
  }

  /**
   * Check if an integration is enabled.
   */
  isEnabled(id: IntegrationId): boolean {
    return this.get(id)?.enabled ?? false;
  }

  /**
   * Get public metadata for integrations.
   */
  getPublicInfo(): IntegrationPublicInfo[] {
    return this.getAll().map((integration) => ({
      id: integration.id,
      name: integration.name,
      description: integration.description,
      enabled: integration.enabled,
    }));
  }
}

const integrationRegistry = new IntegrationRegistry();

export function getIntegrationRegistry(): IntegrationRegistry {
  return integrationRegistry;
}
