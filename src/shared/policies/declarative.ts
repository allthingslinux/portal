import type { z } from 'zod';

import type { PolicyContext, PolicyResult, PolicyStage } from './types';

/**
 * Error code for structured policy failures
 */
export interface PolicyErrorCode {
  /** Machine-readable error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional remediation instructions */
  remediation?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Enhanced policy result with structured error information
 */
export interface PolicyReason extends PolicyErrorCode {
  /** Policy ID that generated this reason */
  policyId: string;
  /** Stage at which this reason was generated */
  stage?: PolicyStage;
}

/**
 * Policy evaluator function with immutable context
 */
export interface PolicyEvaluator<TContext extends PolicyContext> {
  /** Evaluate the policy for a specific stage */
  evaluate(stage?: PolicyStage): Promise<PolicyResult>;

  /** Get the immutable context */
  getContext(): Readonly<TContext>;
}

/**
 * Policy definition factory configuration
 */
export interface FeaturePolicyDefinition<
  TContext extends PolicyContext = PolicyContext,
  TConfig = unknown,
> {
  /** Unique policy identifier */
  id: string;

  /** Optional stages this policy applies to */
  stages?: PolicyStage[];

  /** Optional configuration schema for validation */
  configSchema?: z.ZodType<TConfig>;

  /** Factory function to create evaluator instances */
  create(context: TContext, config?: TConfig): PolicyEvaluator<TContext>;
}

/**
 * Helper function to create a successful policy result
 */
export function allow(metadata?: Record<string, unknown>): PolicyResult {
  return {
    allowed: true,
    metadata,
  };
}

/**
 * Helper function to create a failed policy result with structured error
 */
export function deny(error: PolicyErrorCode): PolicyResult {
  return {
    allowed: false,
    reason: error.message,
    metadata: {
      code: error.code,
      remediation: error.remediation,
      ...error.metadata,
    },
  };
}

/**
 * Deep freeze an object and all its nested properties
 */
function deepFreeze<T>(obj: T, visited = new WeakSet()): Readonly<T> {
  // Prevent infinite recursion with circular references
  if (visited.has(obj as object)) {
    return obj;
  }

  visited.add(obj as object);

  // Get all property names
  const propNames = Reflect.ownKeys(obj as object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = (obj as Record<string, unknown>)[name as string];

    if ((value && typeof value === 'object') || typeof value === 'function') {
      deepFreeze(value, visited);
    }
  }

  return Object.freeze(obj);
}

/**
 * Safe cloning that handles functions and other non-cloneable objects
 */
function safeClone<T>(obj: T): T {
  try {
    return structuredClone(obj);
  } catch {
    // If structuredClone fails (e.g., due to functions), create a shallow clone
    // and recursively clone cloneable properties
    if (obj && typeof obj === 'object') {
      const cloned = Array.isArray(obj) ? ([] as unknown as T) : ({} as T);

      for (const [key, value] of Object.entries(obj)) {
        try {
          // Try to clone individual properties
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cloned as any)[key] = structuredClone(value);
        } catch {
          // If individual property can't be cloned (like functions), keep as-is
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cloned as any)[key] = value;
        }
      }

      return cloned;
    }

    // For primitives or non-cloneable objects, return as-is
    return obj;
  }
}

/**
 * Creates an immutable context wrapper
 */
function createImmutableContext<T extends PolicyContext>(
  context: T,
): Readonly<T> {
  // Safely clone the context, handling functions and other edge cases
  const cloned = safeClone(context);

  // Deep freeze the object to make it immutable
  return deepFreeze(cloned);
}

/**
 * Factory function to define a policy with metadata and configuration
 */
export function definePolicy<
  TContext extends PolicyContext = PolicyContext,
  TConfig = unknown,
>(config: {
  /** Unique policy identifier */
  id: string;

  /** Optional stages this policy applies to */
  stages?: PolicyStage[];

  /** Optional configuration schema for validation */
  configSchema?: z.ZodType<TConfig>;

  /** Policy implementation function */
  evaluate: (
    context: Readonly<TContext>,
    config?: TConfig,
    stage?: PolicyStage,
  ) => Promise<PolicyResult>;
}) {
  return {
    id: config.id,
    stages: config.stages,
    configSchema: config.configSchema,

    create(context: TContext, policyConfig?: TConfig) {
      // Validate configuration if schema is provided
      if (config.configSchema && policyConfig !== undefined) {
        const validation = config.configSchema.safeParse(policyConfig);

        if (!validation.success) {
          throw new Error(
            `Invalid configuration for policy "${config.id}": ${validation.error.message}`,
          );
        }
      }

      // Create immutable context
      const immutableContext = createImmutableContext(context);

      return {
        async evaluate(stage?: PolicyStage) {
          // Check if this policy should run at this stage
          if (stage && config.stages && !config.stages.includes(stage)) {
            return allow({
              skipped: true,
              reason: `Policy not applicable for stage: ${stage}`,
            });
          }

          try {
            const result = await config.evaluate(
              immutableContext,
              policyConfig,
              stage,
            );

            // Ensure metadata includes policy ID and stage
            return {
              ...result,
              metadata: {
                policyId: config.id,
                stage,
                ...result.metadata,
              },
            };
          } catch (error) {
            return deny({
              code: 'POLICY_EVALUATION_ERROR',
              message:
                error instanceof Error
                  ? error.message
                  : 'Policy evaluation failed',
              metadata: {
                policyId: config.id,
                stage,
                error: error instanceof Error ? error.message : 'Unknown error',
              },
            });
          }
        },

        getContext() {
          return immutableContext;
        },
      };
    },
  };
}
