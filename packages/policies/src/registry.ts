import { createRegistry } from '@portal/shared/registry';

import type { FeaturePolicyDefinition } from './declarative';
import type { PolicyContext } from './types';

/**
 * Simple policy registry interface
 */
export interface PolicyRegistry {
  /** Register a single policy definition */
  registerPolicy<
    TContext extends PolicyContext = PolicyContext,
    TConfig = unknown,
  >(
    definition: FeaturePolicyDefinition<TContext, TConfig>,
  ): PolicyRegistry;

  /** Get a policy definition by ID */
  getPolicy<TContext extends PolicyContext = PolicyContext, TConfig = unknown>(
    id: string,
  ): Promise<FeaturePolicyDefinition<TContext, TConfig>>;

  /** Check if a policy exists */
  hasPolicy(id: string): boolean;

  /** List all registered policy IDs */
  listPolicies(): string[];
}

/**
 * Creates a new policy registry instance
 */
export function createPolicyRegistry(): PolicyRegistry {
  const baseRegistry = createRegistry<
    FeaturePolicyDefinition<PolicyContext, unknown>,
    string
  >();

  const policyIds = new Set<string>();

  return {
    registerPolicy<
      TContext extends PolicyContext = PolicyContext,
      TConfig = unknown,
    >(definition: FeaturePolicyDefinition<TContext, TConfig>) {
      // Check for duplicates
      if (policyIds.has(definition.id)) {
        throw new Error(
          `Policy with ID "${definition.id}" is already registered`,
        );
      }

      // Register the policy definition
      baseRegistry.register(definition.id, () => definition);
      policyIds.add(definition.id);

      return this;
    },

    async getPolicy<
      TContext extends PolicyContext = PolicyContext,
      TConfig = unknown,
    >(id: string) {
      if (!policyIds.has(id)) {
        throw new Error(`Policy with ID "${id}" is not registered`);
      }

      return baseRegistry.get(id) as Promise<
        FeaturePolicyDefinition<TContext, TConfig>
      >;
    },

    hasPolicy(id: string) {
      return policyIds.has(id);
    },

    listPolicies() {
      return Array.from(policyIds);
    },
  };
}
