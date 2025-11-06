import type { FeaturePolicyDefinition, PolicyErrorCode } from './declarative';
import type { PolicyRegistry } from './registry';
import type { PolicyContext, PolicyResult, PolicyStage } from './types';

const OPERATORS = {
  ALL: 'ALL' as const,
  ANY: 'ANY' as const,
};

type Operator = (typeof OPERATORS)[keyof typeof OPERATORS];

/**
 * Simple policy function type
 */
export type PolicyFunction<TContext extends PolicyContext = PolicyContext> = (
  context: Readonly<TContext>,
  stage?: PolicyStage,
) => Promise<PolicyResult>;

/**
 * Policy group - just an array of policies with an operator
 */
export interface PolicyGroup<TContext extends PolicyContext = PolicyContext> {
  operator: Operator;
  policies: PolicyFunction<TContext>[];
}

/**
 * Evaluation result
 */
export interface EvaluationResult {
  allowed: boolean;
  reasons: string[];
  results: PolicyResult[];
}

/**
 * LRU Cache for policy definitions with size limit
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);

    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first entry)
      const firstKey = this.cache.keys().next().value;

      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export class PoliciesEvaluator<TContext extends PolicyContext = PolicyContext> {
  // Use WeakMap for registry references to allow garbage collection
  private registryPolicyCache = new WeakMap<
    PolicyRegistry,
    LRUCache<string, FeaturePolicyDefinition<TContext>>
  >();

  private readonly maxCacheSize: number;

  constructor(options?: { maxCacheSize?: number }) {
    this.maxCacheSize = options?.maxCacheSize ?? 100;
  }

  private async getCachedPolicy(
    registry: PolicyRegistry,
    policyId: string,
  ): Promise<FeaturePolicyDefinition<TContext> | undefined> {
    if (!this.registryPolicyCache.has(registry)) {
      this.registryPolicyCache.set(registry, new LRUCache(this.maxCacheSize));
    }

    const cache = this.registryPolicyCache.get(registry)!;

    let definition = cache.get(policyId);

    if (!definition) {
      definition = await registry.getPolicy<TContext>(policyId);

      if (definition) {
        cache.set(policyId, definition);
      }
    }

    return definition;
  }

  /**
   * Clear all cached policies (useful for testing or memory management)
   */
  clearCache(): void {
    // Create new WeakMap to clear all references
    this.registryPolicyCache = new WeakMap();
  }

  async hasPoliciesForStage(
    registry: PolicyRegistry,
    stage?: PolicyStage,
  ): Promise<boolean> {
    const policyIds = registry.listPolicies();

    for (const policyId of policyIds) {
      const definition = await this.getCachedPolicy(registry, policyId);

      if (!definition) {
        continue;
      }

      if (!stage) {
        return true;
      }

      if (!definition.stages) {
        return true;
      }

      if (definition.stages.includes(stage)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate a registry with support for stages and AND/OR logic
   */
  async evaluate(
    registry: PolicyRegistry,
    context: TContext,
    operator: Operator = OPERATORS.ALL,
    stage?: PolicyStage,
  ): Promise<EvaluationResult> {
    const results: PolicyResult[] = [];
    const reasons: string[] = [];
    const policyIds = registry.listPolicies();

    for (const policyId of policyIds) {
      const definition = await this.getCachedPolicy(registry, policyId);

      if (!definition) {
        continue;
      }

      if (stage && definition.stages && !definition.stages.includes(stage)) {
        continue;
      }

      const evaluator = definition.create(context);
      const result = await evaluator.evaluate(stage);

      results.push(result);

      if (!result.allowed && result.reason) {
        reasons.push(result.reason);
      }

      if (operator === OPERATORS.ALL && !result.allowed) {
        return { allowed: false, reasons, results };
      }

      if (operator === OPERATORS.ANY && result.allowed) {
        return { allowed: true, reasons: [], results };
      }
    }

    // Handle edge case: empty policy list with ANY operator
    if (results.length === 0 && operator === OPERATORS.ANY) {
      return {
        allowed: false,
        reasons: ['No policies matched the criteria'],
        results: [],
      };
    }

    const allowed =
      operator === OPERATORS.ALL
        ? results.every((r) => r.allowed)
        : results.some((r) => r.allowed);

    return { allowed, reasons: allowed ? [] : reasons, results };
  }

  /**
   * Evaluate a single group of policies
   */
  async evaluateGroup(
    group: PolicyGroup<TContext>,
    context: TContext,
    stage?: PolicyStage,
  ): Promise<EvaluationResult> {
    const results: PolicyResult[] = [];
    const reasons: string[] = [];

    for (const policy of group.policies) {
      const result = await policy(Object.freeze({ ...context }), stage);
      results.push(result);

      if (!result.allowed && result.reason) {
        reasons.push(result.reason);
      }

      // Short-circuit logic
      if (group.operator === OPERATORS.ALL && !result.allowed) {
        return {
          allowed: false,
          reasons,
          results,
        };
      }

      if (group.operator === OPERATORS.ANY && result.allowed) {
        return {
          allowed: true,
          reasons: [],
          results,
        };
      }
    }

    // Final evaluation
    const allowed =
      group.operator === OPERATORS.ALL
        ? results.every((r) => r.allowed)
        : results.some((r) => r.allowed);

    return {
      allowed,
      reasons: allowed ? [] : reasons,
      results,
    };
  }

  /**
   * Evaluate multiple groups in sequence
   */
  async evaluateGroups(
    groups: PolicyGroup<TContext>[],
    context: TContext,
    stage?: PolicyStage,
  ): Promise<EvaluationResult> {
    const allResults: PolicyResult[] = [];
    const allReasons: string[] = [];

    for (const group of groups) {
      const groupResult = await this.evaluateGroup(group, context, stage);
      allResults.push(...groupResult.results);
      allReasons.push(...groupResult.reasons);

      // Stop on first failure
      if (!groupResult.allowed) {
        return {
          allowed: false,
          reasons: allReasons,
          results: allResults,
        };
      }
    }

    return {
      allowed: true,
      reasons: [],
      results: allResults,
    };
  }

  /**
   * Evaluate a simple array of policies with ALL/ANY logic
   */
  async evaluatePolicies(
    policies: PolicyFunction<TContext>[],
    context: TContext,
    operator: Operator = OPERATORS.ALL,
    stage?: PolicyStage,
  ) {
    return this.evaluateGroup({ operator, policies }, context, stage);
  }
}

/**
 * Helper to create a policy function
 */
export function createPolicy<TContext extends PolicyContext = PolicyContext>(
  evaluate: (
    context: Readonly<TContext>,
    stage?: PolicyStage,
  ) => Promise<PolicyResult>,
): PolicyFunction<TContext> {
  return evaluate;
}

/**
 * Helper policy results
 */
export const allow = (metadata?: Record<string, unknown>): PolicyResult => ({
  allowed: true,
  metadata,
});

// Function overloads for deny() to support both string and structured errors
export function deny(
  reason: string,
  metadata?: Record<string, unknown>,
): PolicyResult;

export function deny(error: PolicyErrorCode): PolicyResult;

export function deny(
  reasonOrError: string | PolicyErrorCode,
  metadata?: Record<string, unknown>,
): PolicyResult {
  if (typeof reasonOrError === 'string') {
    return {
      allowed: false,
      reason: reasonOrError,
      metadata,
    };
  } else {
    return {
      allowed: false,
      reason: reasonOrError.message,
      metadata: {
        code: reasonOrError.code,
        remediation: reasonOrError.remediation,
        ...reasonOrError.metadata,
      },
    };
  }
}

/**
 * Create a policies evaluator with optional configuration
 */
export function createPoliciesEvaluator<
  TContext extends PolicyContext = PolicyContext,
>(options?: { maxCacheSize?: number }) {
  return new PoliciesEvaluator<TContext>(options);
}

/**
 * Convert a registry-based policy to a simple policy function
 */
export async function createPolicyFromRegistry<
  TContext extends PolicyContext = PolicyContext,
>(registry: PolicyRegistry, policyId: string, config?: unknown) {
  const definition = await registry.getPolicy<TContext>(policyId);

  return async (context: Readonly<TContext>, stage?: PolicyStage) => {
    const evaluator = definition.create(context as TContext, config);

    return evaluator.evaluate(stage);
  };
}

/**
 * Create multiple policy functions from registry policy IDs
 */
export async function createPoliciesFromRegistry<
  TContext extends PolicyContext = PolicyContext,
>(registry: PolicyRegistry, policySpecs: Array<string | [string, unknown]>) {
  const policies: PolicyFunction<TContext>[] = [];

  for (const spec of policySpecs) {
    if (typeof spec === 'string') {
      // Simple policy ID
      policies.push(await createPolicyFromRegistry(registry, spec));
    } else {
      // Policy ID with config
      const [policyId, config] = spec;
      policies.push(await createPolicyFromRegistry(registry, policyId, config));
    }
  }

  return policies;
}
